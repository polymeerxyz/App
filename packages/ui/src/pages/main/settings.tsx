import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import browser from "webextension-polyfill";

import MenuButton from "@/components/button/menu-button";
import LanguageDialog from "@/components/dialog/language-dialog";
import NetworkDialog from "@/components/dialog/network-dialog";
import { useTheme } from "@/contexts/theme";
import { openExtensionInBrowser } from "@/lib/utils/extension";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const { version } = browser.runtime.getManifest();

  return (
    <div className="flex flex-1 flex-col space-y-4 p-4">
      <div className="flex flex-1 flex-col">
        <MenuButton
          label={t("settings.expand_view")}
          description={t("settings.open_extension_in_a_new_tab")}
          onClick={() => openExtensionInBrowser()}
        />
        <LanguageDialog />
        <NetworkDialog />
        <MenuButton
          label={t("settings.themes")}
          sublabel={`(${theme === "dark" ? "Dark" : "Light"})`}
          description={t("settings.change_display_mode")}
          onClick={() => {
            setTheme(theme === "dark" ? "light" : "dark");
          }}
          leftIcon={theme === "dark" ? Sun : Moon}
        />
      </div>
      <div className="font-semi-bold self-center text-xs text-foreground/40">
        <p>{t("version_note", { version, env: import.meta.env.MODE })}</p>
      </div>
    </div>
  );
}
