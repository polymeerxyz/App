import { Blocks, Settings, WalletMinimal } from "lucide-react";
import { useMemo } from "react";
import { matchPath, Outlet, useLocation, useNavigate } from "react-router-dom";

import BottomTabNavigator from "@/components/navigator/bottom-tab";
import TopHeader from "@/components/navigator/top-header";
import { useIsPopup } from "@/hooks/useIsPopup";
import { cn } from "@/lib/utils";

function useTabIndex(routes: string[]) {
  const { pathname } = useLocation();
  return routes.findIndex((route) => matchPath(route, pathname));
}

const tabsConfig = [
  {
    key: "/main/token/*",
    Icon: WalletMinimal,
  },
  {
    key: "/main/dao/*",
    Icon: Blocks,
  },
  {
    key: "/main/settings",
    Icon: Settings,
  },
];

export default function PopupLayout() {
  const routes = useMemo(() => tabsConfig.map((tab) => tab.key), []);
  const tabIndex = useTabIndex(routes);
  const isPopup = useIsPopup();

  return (
    <div className="flex h-screen min-h-[600px] min-w-[400px] flex-col items-center justify-center bg-background">
      <div
        className={cn(
          "flex h-full max-h-[960px] w-full max-w-[800px] flex-col overflow-y-scroll bg-card",
          isPopup ? "" : "border",
        )}
      >
        <div className="h-fit pb-14 pt-16">
          <Outlet />
        </div>
        <TopHeader />
        <BottomTabNavigator activeIndex={tabIndex} tabsConfig={tabsConfig} />
      </div>
    </div>
  );
}
