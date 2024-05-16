import {
  createConfig,
  predefined,
  ScriptConfig,
} from "@ckb-lumos/config-manager";

const additionalConfig = {
  mainnet: {
    xudt: {
      CODE_HASH:
        "0x50bd8d6680b8b9cf98b73f3c08faf8b2a21914311954118ad6609be6e78a1b95",
      HASH_TYPE: "data1",
      TX_HASH:
        "0xc07844ce21b38e4b071dd0e1ee3b0e27afd8d7532491327f39b786343f558ab7",
      INDEX: "0x0",
      DEP_TYPE: "code",
    },
    unique: {
      CODE_HASH:
        "0x2c8c11c985da60b0a330c61a85507416d6382c130ba67f0c47ab071e00aec628",
      HASH_TYPE: "data1",
      TX_HASH:
        "0x67524c01c0cb5492e499c7c7e406f2f9d823e162d6b0cf432eacde0c9808c2ad",
      INDEX: "0x0",
      DEP_TYPE: "code",
    },
  },
  testnet: {
    xudt: {
      CODE_HASH:
        "0x25c29dc317811a6f6f3985a7a9ebc4838bd388d19d0feeecf0bcd60f6c0975bb",
      HASH_TYPE: "type",
      TX_HASH:
        "0xbf6fb538763efec2a70a6a3dcb7242787087e1030c4e7d86585bc63a9d337f5f",
      INDEX: "0x0",
      DEP_TYPE: "code",
    },
    unique: {
      CODE_HASH:
        "0x8e341bcfec6393dcd41e635733ff2dca00a6af546949f70c57a706c0f344df8b",
      HASH_TYPE: "type",
      TX_HASH:
        "0xff91b063c78ed06f10a1ed436122bd7d671f9a72ef5f5fa28d05252c17cf4cef",
      INDEX: "0x0",
      DEP_TYPE: "code",
    },
  },
};

export function getConfig(mainnet: boolean) {
  const jsonString = JSON.stringify(
    mainnet ? predefined.LINA : predefined.AGGRON4,
  );
  const newConfig = JSON.parse(jsonString);
  newConfig["SCRIPTS"]["XUDT"] = additionalConfig[
    mainnet ? "mainnet" : "testnet"
  ].xudt as ScriptConfig;
  newConfig["SCRIPTS"]["UNIQUE"] = additionalConfig[
    mainnet ? "mainnet" : "testnet"
  ].unique as ScriptConfig;
  return createConfig(newConfig);
}
