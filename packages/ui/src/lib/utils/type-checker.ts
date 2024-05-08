type Hash = string | null | undefined;

export const typeChecker = {
  hashChecker: (...hashes: Hash[]) => {
    hashes.forEach((hash) => {
      if (hash && (!hash.startsWith("0x") || hash.length !== 66)) {
        throw new Error(`hash ${hash} must start with 0x and has 64 characters`);
      }
    });
  },

  numberChecker: (...nums: Hash[]) => {
    nums.forEach((num) => {
      if (num && (typeof num !== "string" || num.startsWith("0x"))) {
        throw new Error(`number ${num} should be decimal`);
      }
    });
  },
};
