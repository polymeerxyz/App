export interface BaseToken {
  id: string;
  name: string;
  symbol: string;
  tokenDecimal: number;
  logoURI?: string;
}

export interface XUDT extends BaseToken {
  xudtArgs: string;
  xudtCodeHash: string;
  xudtTypeHash: string;
}

export type SupportedToken = Omit<XUDT, "xudtArgs" | "xudtCodeHash" | "xudtTypeHash"> & {
  xudtArgs?: string;
  xudtCodeHash?: string;
  xudtTypeHash?: string;
};
export type SupportedChain = "nervosnetwork";
