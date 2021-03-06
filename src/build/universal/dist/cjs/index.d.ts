declare type MakeUniversalOpts = {
  /**
   * Absolute file system path to the x64 version of your application.  E.g. /Foo/bar/MyApp_x64.app
   */
  x64AppPath: string;
  /**
   * Absolute file system path to the arm64 version of your application.  E.g. /Foo/bar/MyApp_arm64.app
   */
  arm64AppPath: string;
  x64AsarPath?: string;
  arm64AsarPath?: string;
  filesToSkip?: Array<string>;
  /**
   * Absolute file system path you want the universal app to be written to.  E.g. /Foo/var/MyApp_universal.app
   *
   * If this file exists it will be overwritten ONLY if "force" is set to true
   */
  outAppPath: string;
  /**
   * Forcefully overwrite any existing files that are in the way of generating the universal application
   */
  force: boolean;
};
export declare const makeUniversalApp: (opts: MakeUniversalOpts) => Promise<void>;
export {};
