import * as fs from 'fs-extra';
import * as path from 'path';
import { d } from './debug';
export var AsarMode;
(function (AsarMode) {
    AsarMode[AsarMode["NO_ASAR"] = 0] = "NO_ASAR";
    AsarMode[AsarMode["HAS_ASAR"] = 1] = "HAS_ASAR";
})(AsarMode || (AsarMode = {}));
export const detectAsarMode = async (appPath, asarPath) => {
    d('checking asar mode of', appPath);
    const result = asarPath !== null && asarPath !== void 0 ? asarPath : path.resolve(appPath, 'Contents', 'Resources', 'app.asar');
    if (!(await fs.pathExists(result))) {
        d('determined no asar');
        return AsarMode.NO_ASAR;
    }
    d('determined has asar');
    return AsarMode.HAS_ASAR;
};
//# sourceMappingURL=asar-utils.js.map