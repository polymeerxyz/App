import { Script } from "@ckb-lumos/base";

export const areScriptsEqual = (scriptA?: Script, scriptB?: Script) => {
  if (!scriptA || !scriptB) return false;
  return (
    scriptA.codeHash === scriptB.codeHash &&
    scriptA.hashType === scriptB.hashType &&
    scriptA.args === scriptB.args
  );
};
