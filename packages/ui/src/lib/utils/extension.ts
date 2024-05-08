import browser from "webextension-polyfill";

export function reload() {
  browser.runtime.reload();
}

export async function openTab(options: browser.Tabs.CreateCreatePropertiesType) {
  return await browser.tabs.create(options);
}

export async function openWindow(options?: browser.Windows.CreateCreateDataType) {
  return await browser.windows.create(options);
}

export async function focusWindow(windowId: number) {
  await browser.windows.update(windowId, { focused: true });
}

export async function updateWindowPosition(windowId: number, left?: number, top?: number) {
  await browser.windows.update(windowId, { left, top });
}

export async function getLastFocusedWindow() {
  const windowObject = await browser.windows.getLastFocused();
  return windowObject;
}

export async function closeCurrentWindow() {
  const windowDetails = await browser.windows.getCurrent();
  if (windowDetails.id !== undefined) browser.windows.remove(windowDetails.id);
}

export function getVersion() {
  const { version, version_name: versionName } = browser.runtime.getManifest();

  const versionParts = version.split(".");
  if (versionName) {
    if (versionParts.length < 4) {
      throw new Error(`Version missing build number: '${version}'`);
    }
    // On Chrome, a more descriptive representation of the version is stored in the
    // `version_name` field for display purposes. We use this field instead of the `version`
    // field on Chrome for non-main builds (i.e. Flask, Beta) because we want to show the
    // version in the SemVer-compliant format "v[major].[minor].[patch]-[build-type].[build-number]",
    // yet Chrome does not allow letters in the `version` field.
    return versionName;
    // A fourth version part is sometimes present for "rollback" Chrome builds
  } else if (![3, 4].includes(versionParts.length)) {
    throw new Error(`Invalid version: ${version}`);
  } else if (versionParts[2].match(/[^\d]/u)) {
    // On Firefox, the build type and build version are in the third part of the version.
    const [major, minor, patchAndPrerelease] = versionParts;
    const matches = patchAndPrerelease.match(/^(\d+)([A-Za-z]+)(\d)+$/u);
    if (matches === null) {
      throw new Error(`Version contains invalid prerelease: ${version}`);
    }
    const [, patch, buildType, buildVersion] = matches;
    return `${major}.${minor}.${patch}-${buildType}.${buildVersion}`;
  }

  // If there is no `version_name` and there are only 3 or 4 version parts, then this is not a
  // prerelease and the version requires no modification.
  return version;
}

export function getExtensionURL(route = null, queryString = null) {
  let extensionURL = browser.runtime.getURL("index.html");

  if (route) {
    extensionURL += `#${route}`;
  }

  if (queryString) {
    extensionURL += `?${queryString}`;
  }

  return extensionURL;
}

export function openExtensionInBrowser(route = null, queryString = null, keepWindowOpen = false) {
  const extensionURL = getExtensionURL(route, queryString);

  openTab({ url: extensionURL });
}

export async function getPlatformInfo() {
  return await browser.runtime.getPlatformInfo();
}

export async function getAllWindows() {
  return await browser.windows.getAll();
}

export async function getActiveTabs() {
  return await browser.tabs.query({ active: true });
}

export async function getCurrentTab() {
  return await browser.tabs.getCurrent();
}

export async function switchToTab(tabId: number) {
  return await browser.tabs.update(tabId, { highlighted: true });
}

export async function switchToAnotherURL(tabId: number, url: string) {
  return await browser.tabs.update(tabId, { url });
}

export async function closeTab(...tabIds: number[]) {
  await browser.tabs.remove(tabIds);
}
