// swift-tools-version: 5.9
import PackageDescription

// Analiz ProX — eklentiler ../../Plugins klasöründe (node_modules gerekmez)
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.5.3"),
        .package(name: "CapacitorApp", path: "../../Plugins/app"),
        .package(name: "CapacitorBrowser", path: "../../Plugins/browser"),
        .package(name: "CapacitorFilesystem", path: "../../Plugins/filesystem"),
        .package(name: "CapacitorShare", path: "../../Plugins/share"),
        .package(name: "CapacitorSplashScreen", path: "../../Plugins/splash-screen"),
        .package(name: "RevenuecatPurchasesCapacitor", path: "../../Plugins/purchases-capacitor")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorApp", package: "CapacitorApp"),
                .product(name: "CapacitorBrowser", package: "CapacitorBrowser"),
                .product(name: "CapacitorFilesystem", package: "CapacitorFilesystem"),
                .product(name: "CapacitorShare", package: "CapacitorShare"),
                .product(name: "CapacitorSplashScreen", package: "CapacitorSplashScreen"),
                .product(name: "RevenuecatPurchasesCapacitor", package: "RevenuecatPurchasesCapacitor")
            ]
        )
    ]
)
