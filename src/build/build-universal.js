const {
    makeUniversalApp
} = require('./universal');
const path = require("path");

async function main() {
    // https://github.com/deepak1556/universal
    // https://fossies.org/linux/vscode/build/darwin/create-universal-app.ts
    await makeUniversalApp({
        filesToSkip: [
            'product.json',
            'Credits.rtf',
            'CodeResources',
            'fsevents.node',
            'Info.plist',
            '.npmrc'
        ],
        x64AppPath: path.join(__dirname, '../dist', 'mac', 'Ohtipi.app'),
        arm64AppPath: path.join(__dirname, '../dist', 'mac-arm64', 'Ohtipi.app'),
        x64AsarPath: path.join(__dirname, '../dist', 'mac', 'Ohtipi.app', 'Contents', 'Resources', 'app.asar'),
        arm64AsarPath: path.join(__dirname, '../dist', 'mac-arm64', 'Ohtipi.app', 'Contents', 'Resources', 'app.asar'),
        outAppPath: path.join(__dirname, '../dist/mac-universal/Ohtipi.app'),
        force: true
    });
}

main()