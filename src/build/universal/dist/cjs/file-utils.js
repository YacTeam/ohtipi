"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAppFiles = exports.AppFileType = void 0;
const cross_spawn_promise_1 = require("@malept/cross-spawn-promise");
const fs = require("fs-extra");
const path = require("path");
const MACHO_PREFIX = 'Mach-O ';
var AppFileType;
(function (AppFileType) {
    AppFileType[AppFileType["MACHO"] = 0] = "MACHO";
    AppFileType[AppFileType["PLAIN"] = 1] = "PLAIN";
    AppFileType[AppFileType["SNAPSHOT"] = 2] = "SNAPSHOT";
    AppFileType[AppFileType["APP_CODE"] = 3] = "APP_CODE";
})(AppFileType = exports.AppFileType || (exports.AppFileType = {}));
/**
 *
 * @param appPath Path to the application
 */
const getAllAppFiles = async (appPath, filesToSkip) => {
    const files = [];
    const visited = new Set();
    const traverse = async (p) => {
        p = await fs.realpath(p);
        if (filesToSkip === null || filesToSkip === void 0 ? void 0 : filesToSkip.find((e) => p.includes(e)))
            return;
        if (visited.has(p))
            return;
        visited.add(p);
        const info = await fs.stat(p);
        if (info.isSymbolicLink())
            return;
        if (info.isFile()) {
            let fileType = AppFileType.PLAIN;
            if (!p.endsWith('.wasm')) {
                const fileOutput = await cross_spawn_promise_1.spawn('file', ['--brief', '--no-pad', p]);
                if (p.endsWith('.asar')) {
                    fileType = AppFileType.APP_CODE;
                }
                else if (fileOutput.startsWith(MACHO_PREFIX)) {
                    fileType = AppFileType.MACHO;
                }
                else if (p.endsWith('.bin')) {
                    fileType = AppFileType.SNAPSHOT;
                }
            }
            files.push({
                relativePath: path.relative(appPath, p),
                type: fileType,
            });
        }
        if (info.isDirectory()) {
            for (const child of await fs.readdir(p)) {
                await traverse(path.resolve(p, child));
            }
        }
    };
    await traverse(appPath);
    return files;
};
exports.getAllAppFiles = getAllAppFiles;
//# sourceMappingURL=file-utils.js.map