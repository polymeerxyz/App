import browser from "webextension-polyfill";

import { openTab } from "@/lib/utils/extension";
import { services } from "@/scripts/background";

let scriptsLoadInitiated = false;

const loadTimeLogs = [];

function tryImport(...fileNames: string[]) {
  try {
    const startTime = new Date().getTime();
    importScripts(...fileNames);
    const endTime = new Date().getTime();
    loadTimeLogs.push({
      name: fileNames[0],
      value: endTime - startTime,
      children: [],
      startTime,
      endTime,
    });

    return true;
  } catch (e) {
    console.error(e);
  }

  return false;
}

function importAllScripts() {
  // Bail if we've already imported scripts
  if (scriptsLoadInitiated) {
    return;
  }
  scriptsLoadInitiated = true;
  const files = [];

  // In testMode individual files are imported, this is to help capture load time stats
  const loadFile = (fileName: string) => {
    files.push(fileName);
  };

  const startImportScriptsTime = Date.now();
}

async function initialize() {
  // browser.runtime.onInstalled.addListener(function (details) {
  //   openTab({ url: "index.html#/register/do-onboarding" });
  // });

  browser.runtime.onMessage.addListener(async (message: { type: string; payload: any }) => {
    const { type, payload } = message;
    const [name, _] = type.split("/");
    const service = Object.values(services).find((service) => service.name === name);
    if (!service) return;
    return service.listen({ type, payload });
  });
}

initialize();
