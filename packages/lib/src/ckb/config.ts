import {
  createConfig,
  predefined,
  ScriptConfig,
} from "@ckb-lumos/config-manager";

const xudtConfigs = {
  mainnet: {
    CODE_HASH:
      "0x50bd8d6680b8b9cf98b73f3c08faf8b2a21914311954118ad6609be6e78a1b95",
    HASH_TYPE: "data1",
    TX_HASH:
      "0xc07844ce21b38e4b071dd0e1ee3b0e27afd8d7532491327f39b786343f558ab7",
    INDEX: "0x0",
    DEP_TYPE: "code",
  },
  testnet: {
    CODE_HASH:
      "0x25c29dc317811a6f6f3985a7a9ebc4838bd388d19d0feeecf0bcd60f6c0975bb",
    HASH_TYPE: "type",
    TX_HASH:
      "0xbf6fb538763efec2a70a6a3dcb7242787087e1030c4e7d86585bc63a9d337f5f",
    INDEX: "0x0",
    DEP_TYPE: "code",
  },
};

export function getConfig(mainnet: boolean) {
  const jsonString = JSON.stringify(
    mainnet ? predefined.LINA : predefined.AGGRON4,
  );
  const newConfig = JSON.parse(jsonString);
  newConfig["SCRIPTS"]["XUDT"] = xudtConfigs[
    mainnet ? "mainnet" : "testnet"
  ] as ScriptConfig;
  return createConfig(newConfig);
}
