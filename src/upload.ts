import { execSync } from "child_process";
import path from "path";

import { parseArguments } from "./parse";

(async function () {
  const { clientId, clientSecret, refreshToken } = parseArguments();
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing required arguments");
  }

  const accessTokenJson = execSync(
    `curl "https://oauth2.googleapis.com/token" -d "client_secret=${clientSecret}&grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${clientId}"`,
  ).toString();

  const { access_token } = JSON.parse(accessTokenJson);

  const result = execSync(
    `curl -H "Authorization: Bearer ${access_token}" -H "x-goog-api-version: 2" -X PUT -T ${path.resolve(__dirname, "../polymeerxyz.zip")} -v https://www.googleapis.com/upload/chromewebstore/v1.1/items/ffkoonaehdokfjdaikljgnflpcjfnckc`,
  ).toString();

  console.log(result);
})();
