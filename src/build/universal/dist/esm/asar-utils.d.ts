export declare enum AsarMode {
  NO_ASAR = 0,
  HAS_ASAR = 1,
}
export declare const detectAsarMode: (
  appPath: string,
  asarPath?: string | undefined,
) => Promise<AsarMode>;
