import { Config } from "@ckb-lumos/config-manager";
import { AccountExtendedPublicKey, AddressType } from "@ckb-lumos/hd";
import { encodeToAddress, generateAddress } from "@ckb-lumos/helpers";

export const publicKeyToAddress = (
  accountExtendedPublicKey: AccountExtendedPublicKey,
  addressType: AddressType,
  index: number,
  config: Config,
) => {
  const pubkey = accountExtendedPublicKey.publicKeyInfo(addressType, index).blake160;
  const lockScript = {
    codeHash: config.SCRIPTS.SECP256K1_BLAKE160!.CODE_HASH,
    hashType: config.SCRIPTS.SECP256K1_BLAKE160!.HASH_TYPE,
    args: pubkey,
  };
  return encodeToAddress(lockScript, { config });
};

export const publicKeyToLegacyAddress = (
  accountExtendedPublicKey: AccountExtendedPublicKey,
  addressType: AddressType,
  index: number,
  config: Config,
) => {
  const pubkey = accountExtendedPublicKey.publicKeyInfo(addressType, index).blake160;
  const lockScript = {
    codeHash: config.SCRIPTS.SECP256K1_BLAKE160!.CODE_HASH,
    hashType: config.SCRIPTS.SECP256K1_BLAKE160!.HASH_TYPE,
    args: pubkey,
  };
  return generateAddress(lockScript, { config });
};
