const config = require("../config.js");

module.exports = {
    copyright: "© 2021, Yac Inc.",
    appId: config.build.setApp ? "com.ohtipi.app-setapp" : "com.ohtipi.app",
    icon: "./assets/dock/dock-icon.icns",
    files: [
        "./**/*",
        "./**/**/*",
        "node_modules/**/*",
        "package.json",
        // include extra native modules if setapp
        config.build.setApp ? "binaries/*.node" : undefined,
    ],
    npmRebuild: false,
    forceCodeSigning: true,
    mac: {
        hardenedRuntime: true,
        gatekeeperAssess: false,
        entitlements: "build/entitlements.mac.plist",
        entitlementsInherit: "build/entitlements.mac.plist",
        type: "distribution",
        darkModeSupport: true,
        artifactName: "${productName}-${arch}-${version}.${ext}",
        target: config.build.setApp ? [{
            target: "zip",
            arch: ["x64"]
        }] : undefined,
        // don't publish if setapp
        publish: !config.build.setApp ? {
            provider: "s3",
            bucket: "ohtipi-release",
            region: "us-east-1"
        } : undefined
    },
    afterSign: "build/notarize.js"
}