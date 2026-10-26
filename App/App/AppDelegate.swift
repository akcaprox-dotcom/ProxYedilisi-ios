import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}

// MARK: - Analiz ProX: köprü görünüm denetleyicisi + yerel PDF eklentisi
// Not: Yeni .swift dosyası eklemek project.pbxproj kaydı gerektirdiği için
// bu sınıflar bilerek AppDelegate.swift içinde tutuluyor.

class ApxViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(ApxPrintPlugin())
        overrideUserInterfaceStyle = .dark   // uygulama koyu temalı: klavye, menü ve durum çubuğu buna uysun
        view.backgroundColor = UIColor(red: 8/255, green: 11/255, blue: 20/255, alpha: 1)
    }

    override var preferredStatusBarStyle: UIStatusBarStyle { .lightContent }
}

@objc(ApxPrintPlugin)
public class ApxPrintPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ApxPrintPlugin"
    public let jsName = "ApxPrint"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "print", returnType: CAPPluginReturnPromise)
    ]

    /// Görünen sayfayı (yazdırma görünümüyle) A4 PDF'e çevirir ve paylaşım menüsünü açar:
    /// Dosyalara kaydet, Mail, WhatsApp, Yazdır…
    @objc func print(_ call: CAPPluginCall) {
        let raw = call.getString("name") ?? "Analiz ProX"
        let name = raw.components(separatedBy: CharacterSet(charactersIn: "/\\:*?\"<>|")).joined(separator: "-")
        DispatchQueue.main.async {
            guard let webView = self.bridge?.webView, let vc = self.bridge?.viewController else {
                call.reject("WebView bulunamadı")
                return
            }
            let renderer = UIPrintPageRenderer()
            renderer.addPrintFormatter(webView.viewPrintFormatter(), startingAtPageAt: 0)
            let paper = CGRect(x: 0, y: 0, width: 595.2, height: 841.8) // A4 (pt)
            renderer.setValue(NSValue(cgRect: paper), forKey: "paperRect")
            renderer.setValue(NSValue(cgRect: paper.insetBy(dx: 28, dy: 32)), forKey: "printableRect")

            let data = NSMutableData()
            UIGraphicsBeginPDFContextToData(data, paper, nil)
            renderer.prepare(forDrawingPages: NSRange(location: 0, length: renderer.numberOfPages))
            for i in 0..<renderer.numberOfPages {
                UIGraphicsBeginPDFPage()
                renderer.drawPage(at: i, in: UIGraphicsGetPDFContextBounds())
            }
            UIGraphicsEndPDFContext()

            let url = FileManager.default.temporaryDirectory.appendingPathComponent(name + ".pdf")
            do {
                try? FileManager.default.removeItem(at: url)
                try data.write(to: url, options: .atomic)
            } catch {
                call.reject("PDF yazılamadı: \(error.localizedDescription)")
                return
            }
            let sheet = UIActivityViewController(activityItems: [url], applicationActivities: nil)
            if let pop = sheet.popoverPresentationController {
                pop.sourceView = webView
                pop.sourceRect = CGRect(x: webView.bounds.midX, y: webView.bounds.midY, width: 1, height: 1)
                pop.permittedArrowDirections = []
            }
            vc.present(sheet, animated: true)
            call.resolve(["pages": renderer.numberOfPages])
        }
    }
}
