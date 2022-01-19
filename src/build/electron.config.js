const config = require("../config.js");

module.exports = {
    copyright: "© 2022, Yac Inc.",
    appId: config.build.setApp ? "com.ohtipi.app-setapp" : "com.ohtipi.app",
    icon: "./assets/dock/dock-icon.icns",
    files: [
        "./**/*",
        "./**/**/*",
        "node_modules/**/*",
        "package.json"
    ],
    mac: {
        hardenedRuntime: true,
        gatekeeperAssess: false,
        entitlements: "build/entitlements.mac.plist",
        entitlementsInherit: "build/entitlements.mac.plist",
        type: "distribution",
        darkModeSupport: true,
        artifactName: "${productName}-${arch}-${version}.${ext}",
        target: [
            {
                target: "default",
                arch: ["x64", "arm64"]
            }
        ],
        publish: {
            provider: "s3",
            bucket: "ohtipi-release",
            region: "us-east-1"
        }
    },
    dmg: {
        sign: false
    },
    afterSign: "build/notarize.js"
}