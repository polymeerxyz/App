export type WalletType = "ledger" | "mnemonic" | "private-key";

export type WalletInfo = {
  id: string;
  name: string;
  serializedAccountExtendedPublicKey: string;
  type: WalletType;
};
