import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import browser from "webextension-polyfill";

import MenuButton from "@/components/button/menu-button";
import NetworkDialog from "@/components/dialog/network-dialog";
import { useTheme } from "@/contexts/theme";
import { openExtensionInBrowser } from "@/lib/utils/extension";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const { version } = browser.runtime.getManifest();

  return (
    <div className="flex flex-1 flex-col space-y-4 p-4">
      <div className="flex flex-1 flex-col">
        <MenuButton
          label="Expand view"
          description="Open extension in new tab"
          onClick={() => openExtensionInBrowser()}
        />
        <MenuButton
          label="Languages"
          sublabel={`(${i18n.language.toUpperCase()})`}
          description="Choose another display language"
          onClick={() => {}}
        />
        <MenuButton
          label="Themes"
          sublabel={`(${theme === "dark" ? "Dark" : "Light"})`}
          description="Switch theme"
          onClick={() => {
            setTheme(theme === "dark" ? "light" : "dark");
          }}
          leftIcon={theme === "dark" ? Sun : Moon}
        />
        <NetworkDialog />
      </div>
      <div className="font-semi-bold self-center text-xs text-foreground/40">
        <p>{`Version: ${version} - ${import.meta.env.MODE}`}</p>
      </div>
    </div>
  );
}
