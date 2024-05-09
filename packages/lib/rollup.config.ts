import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

const config = defineConfig([
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.mjs", format: "es" }],
    plugins: [
      json(),
      typescript({
        tsconfig: "./tsconfig.json",
        compilerOptions: {
          rootDir: "src",
          declaration: true,
          declarationDir: "dist",
        },
      }),
      commonjs(),
    ],
  },
]);

export default config;
