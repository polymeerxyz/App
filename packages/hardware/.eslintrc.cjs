module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ["plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["simple-import-sort"],
  ignorePatterns: ["dist", "node_modules"],
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
  },
};
