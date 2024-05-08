import { ExtendedPrivateKey } from "@ckb-lumos/hd";

export class PrivateKeyCache {
  private _keyMap: Map<string, { key: ExtendedPrivateKey; expiredAt: number }>;

  constructor() {
    this._keyMap = new Map();
  }

  saveKey = (id: string, key: ExtendedPrivateKey) => {
    this._keyMap.set(id, { key, expiredAt: Date.now() + 1000 * 60 * 30 /* 5 mins */ });
  };

  getKey = (id: string) => {
    return this._keyMap.get(id)?.key;
  };

  hasKey = (id: string) => {
    return this._keyMap.has(id);
  };

  removeKey = (id: string) => {
    this._keyMap.delete(id);
  };

  evictExpiredKey = () => {
    for (const [key, value] of this._keyMap) {
      if (value.expiredAt <= Date.now()) {
        this._keyMap.delete(key);
      }
    }
  };
}
