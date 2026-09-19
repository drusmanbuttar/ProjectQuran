import XCTest
import UIKit
import WebKit
@testable import App

@MainActor
final class PocketQuranTests: XCTestCase {
    private func controller() async throws -> PocketViewController {
        for _ in 0..<100 {
            let windows = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.flatMap { $0.windows }
            if let vc = windows.compactMap({ $0.rootViewController as? PocketViewController }).first, vc.webView != nil { return vc }
            try await Task.sleep(nanoseconds: 200_000_000)
        }
        throw NSError(domain: "PocketTests", code: 1, userInfo: [NSLocalizedDescriptionKey: "No Pocket Quran view controller"])
    }
    private func until(_ expression: String, web: WKWebView) async throws {
        for _ in 0..<150 {
            if (try? await web.evaluateJavaScript(expression)) as? Bool == true { return }
            try await Task.sleep(nanoseconds: 200_000_000)
        }
        XCTFail("Timed out: " + expression)
        throw NSError(domain: "PocketTests", code: 2)
    }
    private func picker(_ vc: PocketViewController) async throws -> UIDocumentPickerViewController {
        for _ in 0..<100 {
            if let value = vc.presentedViewController as? UIDocumentPickerViewController { return value }
            try await Task.sleep(nanoseconds: 100_000_000)
        }
        throw NSError(domain: "PocketTests", code: 3, userInfo: [NSLocalizedDescriptionKey: "Files picker did not appear"])
    }
    private func importFile(_ file: URL, vc: PocketViewController, web: WKWebView) async throws {
        _ = try await web.evaluateJavaScript("document.getElementById('import-notes').click(); true")
        let presented = try await picker(vc)
        vc.researchBackup.documentPicker(presented, didPickDocumentsAt: [file])
        presented.dismiss(animated: false)
    }
    func testBundledReadingAndNativeBackupRecovery() async throws {
        let vc = try await controller(); let web = try XCTUnwrap(vc.webView)
        let rules = try await WKContentRuleListStore.default().compileContentRuleList(forIdentifier: "NoNetwork", encodedContentRuleList: "[{\"trigger\":{\"url-filter\":\"^https?://\"},\"action\":{\"type\":\"block\"}}]")
        web.configuration.userContentController.add(try XCTUnwrap(rules))
        try await until("document.querySelector('.event-card')!==null", web: web)
        _ = try await web.evaluateJavaScript("localStorage.clear(); document.body.dataset.old='yes'; location.reload(); true")
        try await until("document.body.dataset.old!=='yes'&&document.querySelector('.event-card')!==null", web: web)
        let platform = try await web.evaluateJavaScript("Capacitor.getPlatform()") as? String
        XCTAssertEqual(platform, "ios")
        XCTAssertEqual(web.url?.scheme, "capacitor")
        XCTAssertEqual(Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String, "Pocket Quran")
        _ = try await web.evaluateJavaScript("fetch('https://example.com').then(()=>window.externalBlocked=false).catch(()=>window.externalBlocked=true); true")
        try await until("window.externalBlocked===true", web: web)
        _ = try await web.evaluateJavaScript("location.hash='reader'; true")
        try await until("document.querySelectorAll('.verse').length===7", web: web)
        let languages = try await web.evaluateJavaScript("!!document.querySelector('.verse [lang=ar]')&&!!document.querySelector('.verse [lang=en]')&&!!document.querySelector('.verse [lang=ur]')") as? Bool
        XCTAssertEqual(languages, true)
        _ = try await web.evaluateJavaScript("location.hash='notebook'; true")
        try await until("document.getElementById('import-notes')!==null", web: web)
        let folder = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: folder) }
        let input = folder.appendingPathComponent("research.json")
        let fixture = "{\"format\":\"ProjectQuran\",\"version\":1,\"notes\":[{\"title\":\"تحقیق — آدم\",\"body\":\"Arabic اردو recovery\",\"refs\":[\"2:30\"]}],\"saved\":[\"2:255\"]}"
        try BackupCodec.encode(fixture).write(to: input)
        try await importFile(input, vc: vc, web: web)
        try await until("document.querySelectorAll('.research-entry').length===1", web: web)
        _ = try await web.evaluateJavaScript("document.getElementById('export-notes').click(); true")
        let exportPicker = try await picker(vc)
        let exportedURL = try XCTUnwrap(vc.researchBackup.exportURL)
        let exportedText = try BackupCodec.read(exportedURL)
        XCTAssertTrue(exportedText.contains("تحقیق — آدم")); XCTAssertTrue(exportedText.contains("2:255"))
        try BackupCodec.encode(exportedText).write(to: input)
        vc.researchBackup.documentPicker(exportPicker, didPickDocumentsAt: [input])
        exportPicker.dismiss(animated: false)
        try await until("document.getElementById('toast').textContent.includes('Backup saved')", web: web)
        _ = try await web.evaluateJavaScript("localStorage.clear(); document.body.dataset.old='yes';location.reload(); true")
        try await until("document.body.dataset.old!=='yes'&&document.getElementById('import-notes')!==null", web: web)
        let emptyCount = try await web.evaluateJavaScript("document.querySelectorAll('.research-entry').length") as? Int
        XCTAssertEqual(emptyCount, 0)
        try await importFile(input, vc: vc, web: web)
        try await until("document.querySelectorAll('.research-entry').length===1", web: web)
        try await importFile(input, vc: vc, web: web)
        try await until("document.getElementById('toast').textContent.includes('Imported 0')", web: web)
        try BackupCodec.encode(fixture.replacingOccurrences(of: "2:30", with: "115:1")).write(to: input)
        try await importFile(input, vc: vc, web: web)
        try await until("document.getElementById('toast').textContent.includes('Import failed')", web: web)
        let count = try await web.evaluateJavaScript("document.querySelectorAll('.research-entry').length") as? Int
        XCTAssertEqual(count, 1)
        let saved = try await web.evaluateJavaScript("JSON.parse(localStorage.getItem('pq-research')).saved[0]") as? String
        XCTAssertEqual(saved, "2:255")
    }
    func testUTF8AndLimits() throws {
        let file = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: file) }
        let text = "تحقیق — آدم اردو"
        try BackupCodec.encode(text).write(to: file)
        XCTAssertEqual(try BackupCodec.read(file), text)
        XCTAssertThrowsError(try BackupCodec.encode(String(repeating: "a", count: BackupCodec.maximumBytes + 1)))
        try Data(repeating: 1, count: BackupCodec.maximumBytes + 1).write(to: file)
        XCTAssertThrowsError(try BackupCodec.read(file))
        try Data([0xff, 0xfe]).write(to: file)
        XCTAssertThrowsError(try BackupCodec.read(file))
    }
}
