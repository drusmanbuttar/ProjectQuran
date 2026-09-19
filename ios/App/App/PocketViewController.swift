import Capacitor

class PocketViewController: CAPBridgeViewController {
    let researchBackup = ResearchBackupPlugin()
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(researchBackup)
    }
}
