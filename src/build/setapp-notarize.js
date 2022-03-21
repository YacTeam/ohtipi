const path = require("path");
require('dotenv').config();

const {
    notarize
} = require('electron-notarize');

async function main() {
    await notarize({
        appBundleId: 'com.ohtipi.app-setapp',
        appPath: path.join(__dirname, '../dist/mac-universal/Ohtipi.app'),
        appleId: process.env.APPLEID,
        appleIdPassword: process.env.APPLEIDPASS,
    });
    console.log("Finished notarizing universal Setapp bundle!");
}


main()