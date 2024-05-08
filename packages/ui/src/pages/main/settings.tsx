import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import MenuButton from "@/components/button/menu-button";
import NetworkDialog from "@/components/dialog/network-dialog";
import { useTheme } from "@/contexts/theme";
import { openExtensionInBrowser } from "@/lib/utils/extension";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4 p-4">
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
  );
}
