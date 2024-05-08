import fs from "fs";
import path from "path";

import manifestJson from "../packages/ui/manifest/base.json";
import { parseArguments } from "./parse";

(async function () {
  const { version } = parseArguments();
  if (!version) {
    throw new Error("Version is required");
  }

  if (!version.startsWith("ui-")) {
    throw new Error("UI version must start with 'ui-'");
  }

  manifestJson.version = version.replace("ui-", "");

  fs.writeFileSync(
    path.resolve(__dirname, "../packages/ui/manifest/base.json"),
    JSON.stringify(manifestJson, null, 2),
  );
})();
