import React, { HTMLAttributes } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  activeIndex: number;
  tabsConfig: {
    key: string;
    Icon: React.ComponentType<HTMLAttributes<SVGElement>>;
  }[];
}

export default function BottomTabNavigator({ className, activeIndex, tabsConfig }: Props) {
  return (
    <div
      className={cn(
        "fixed bottom-0 grid h-14 w-full max-w-[800px] border-t bg-card",
        `grid-cols-${tabsConfig.length}`,
        className,
      )}
    >
      {tabsConfig.map(({ key, Icon }, index) => (
        <Button key={key} variant="ghost" size="icon" className="self-center justify-self-center" asChild>
          <Link to={`${key.replace("/*", "")}`}>
            <Icon className={cn(activeIndex === index ? "stroke-primary" : "stroke-muted-foreground")} />
          </Link>
        </Button>
      ))}
    </div>
  );
}
