import { Blocks, Settings, WalletMinimal } from "lucide-react";
import { useMemo } from "react";
import { matchPath, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useWindowSize } from "react-use";

import BottomTabNavigator from "@/components/navigator/bottom-tab";
import TopHeader from "@/components/navigator/top-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

function useTabIndex(routes: string[]) {
  const { pathname } = useLocation();
  return routes.findIndex((route) => matchPath(route, pathname));
}

const tabsConfig = [
  {
    key: "/main",
    Icon: WalletMinimal,
  },
  {
    key: "/main/dao",
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

  const { width, height } = useWindowSize();
  const isPopup = width === 400 && height === 600;

  return (
    <div className="flex h-screen min-h-[600px] min-w-[400px] flex-col items-center justify-center bg-background">
      <div className={cn("flex h-full max-h-[960px] w-full max-w-[800px] flex-col bg-card", isPopup ? "" : "border")}>
        <TopHeader />
        <ScrollArea className={cn("w-full", `h-[${Math.max(Math.min(960, height) - 64 - 56, 478)}px]`)}>
          <Outlet />
        </ScrollArea>
        <BottomTabNavigator className="mt-auto" activeIndex={tabIndex} tabsConfig={tabsConfig} />
      </div>
    </div>
  );
}
