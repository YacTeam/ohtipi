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
        "binaries/*.node"
    ],
    mac: {
        hardenedRuntime: true,
        gatekeeperAssess: false,
        entitlements: "build/entitlements.mac.plist",
        entitlementsInherit: "build/entitlements.mac.plist",
        type: "distribution",
        darkModeSupport: true,
        publish: !config.build.setApp ? {
            provider: "s3",
            bucket: "ohtipi-release",
            region: "us-east-1"
        } : undefined
    },
    dmg: {
        sign: false
    },
    afterSign: "build/notarize.js"
}