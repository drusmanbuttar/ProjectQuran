import Capacitor
import UIKit
import UniformTypeIdentifiers

@objc(ResearchBackupPlugin)
public class ResearchBackupPlugin: CAPPlugin, CAPBridgedPlugin, UIDocumentPickerDelegate {
    public let identifier = "ResearchBackupPlugin"
    public let jsName = "ResearchBackup"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "exportFile", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "importFile", returnType: CAPPluginReturnPromise)
    ]
    private var pending: CAPPluginCall?
    private var exporting = false
    private(set) var exportURL: URL?

    @objc func exportFile(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            guard self.pending == nil else { call.reject("A backup operation is already open."); return }
            guard let text = call.getString("data") else { call.reject("No backup data provided."); return }
            do {
                let data = try BackupCodec.encode(text)
                let folder = FileManager.default.temporaryDirectory.appendingPathComponent("PocketQuran-" + UUID().uuidString, isDirectory: true)
                try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
                let url = folder.appendingPathComponent("Pocket-Quran-research.json")
                self.exportURL = url
                try data.write(to: url, options: .atomic)
                self.exporting = true
                self.present(UIDocumentPickerViewController(forExporting: [url], asCopy: true), call: call)
            } catch { self.cleanup(); call.reject("Could not prepare backup: " + error.localizedDescription) }
        }
    }

    @objc func importFile(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            guard self.pending == nil else { call.reject("A backup operation is already open."); return }
            self.exporting = false
            self.present(UIDocumentPickerViewController(forOpeningContentTypes: [.json, .plainText], asCopy: true), call: call)
        }
    }

    private func present(_ picker: UIDocumentPickerViewController, call: CAPPluginCall) {
        guard let controller = bridge?.viewController, controller.presentedViewController == nil else {
            cleanup(); call.reject("Close the current screen and try again."); return
        }
        pending = call
        picker.delegate = self
        picker.allowsMultipleSelection = false
        picker.modalPresentationStyle = .formSheet
        controller.present(picker, animated: true)
    }

    public func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        guard let call = pending else { return }
        defer { cleanup() }
        guard let url = urls.first else { call.reject("No file selected.", "CANCELLED"); return }
        if exporting { call.resolve(); return }
        let access = url.startAccessingSecurityScopedResource()
        defer { if access { url.stopAccessingSecurityScopedResource() } }
        var coordinationError: NSError?
        var outcome: Result<String, Error>?
        NSFileCoordinator().coordinate(readingItemAt: url, options: [], error: &coordinationError) { selected in
            outcome = Result { try BackupCodec.read(selected) }
        }
        if let error = coordinationError { call.reject(error.localizedDescription); return }
        switch outcome {
        case .success(let text): call.resolve(["data": text])
        case .failure(let error): call.reject(error.localizedDescription)
        case nil: call.reject("The selected backup could not be read.")
        }
    }

    public func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
        pending?.reject("Backup operation cancelled.", "CANCELLED")
        cleanup()
    }

    private func cleanup() {
        pending = nil
        if let url = exportURL { try? FileManager.default.removeItem(at: url.deletingLastPathComponent()) }
        exportURL = nil
    }
}
