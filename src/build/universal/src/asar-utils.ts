import * as fs from 'fs-extra';
import * as path from 'path';
import { d } from './debug';

export enum AsarMode {
  NO_ASAR,
  HAS_ASAR,
}

export const detectAsarMode = async (appPath: string, asarPath?: string) => {
  d('checking asar mode of', appPath);
  const result = asarPath ?? path.resolve(appPath, 'Contents', 'Resources', 'app.asar');

  if (!(await fs.pathExists(result))) {
    d('determined no asar');
    return AsarMode.NO_ASAR;
  }

  d('determined has asar');
  return AsarMode.HAS_ASAR;
};
