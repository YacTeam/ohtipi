require('dotenv').config();
const config = require("../config.js");

const {
    notarize
} = require('electron-notarize');

exports.default = async function notarizing(context) {
    const {
        electronPlatformName,
        appOutDir
    } = context;
    if (electronPlatformName !== 'darwin') {
        return;
    }

    const appName = context.packager.appInfo.productFilename;

    return await notarize({
        appBundleId: config.build.setApp ? 'com.ohtipi.app-setapp' : 'com.ohtipi.app',
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.APPLEID,
        appleIdPassword: process.env.APPLEIDPASS,
    });
}
