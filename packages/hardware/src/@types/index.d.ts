declare module "bip32-path" {
  class BIPPath {
    constructor(path: Array<number>);
    static fromString(text: string, reqRoot = true): BIPPath;
    toPathArray(): Array<number>;
  }

  export = BIPPath;
}
