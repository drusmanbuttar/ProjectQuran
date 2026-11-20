import UIKit
import Capacitor
import StoreKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = QuranBridgeController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

final class QuranBridgeController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(QuranTip())
    }
}

@objc(QuranTip)
final class QuranTip: CAPPlugin, CAPBridgedPlugin {
    let identifier = "QuranTip"
    let jsName = "QuranTip"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "price", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise)
    ]
    private let id = "com.drusmanbuttar.projectquran.support.tip"
    private var updates: Task<Void, Never>?
    @MainActor private var purchasing = false

    override func load() {
        let productID = id
        updates = Task {
            for await result in Transaction.updates {
                if case .verified(let tip) = result, tip.productID == productID {
                    await tip.finish()
                }
            }
        }
        Task {
            for await result in Transaction.unfinished {
                if case .verified(let tip) = result, tip.productID == productID {
                    await tip.finish()
                }
            }
        }
    }

    deinit { updates?.cancel() }

    private enum TipLookupError: Error { case missingConsumable }

    private func product() async throws -> Product {
        guard let tip = try await Product.products(for: [id]).first, tip.type == .consumable
        else { throw TipLookupError.missingConsumable }
        return tip
    }

    @objc func price(_ call: CAPPluginCall) {
        Task {
            do { call.resolve(["price": try await product().displayPrice]) }
            catch TipLookupError.missingConsumable {
                call.reject("No matching consumable", "TIP_NOT_AVAILABLE")
            } catch {
                let underlying = error as NSError
                call.reject("Store unavailable", "STOREKIT:\(underlying.domain) \(underlying.code)")
            }
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        Task { @MainActor in
            guard !purchasing else { call.resolve(["status":"busy"]); return }
            purchasing = true
            defer { purchasing = false }
            do {
                switch try await product().purchase() {
                case .success(.verified(let tip)) where tip.productID == id:
                    await tip.finish()
                    call.resolve(["status":"paid"])
                case .userCancelled: call.resolve(["status":"cancelled"])
                case .pending: call.resolve(["status":"pending"])
                default: call.reject("Purchase could not be verified")
                }
            } catch { call.reject("Store unavailable") }
        }
    }
}
