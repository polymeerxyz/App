import { ChevronRight } from "lucide-react";
import { forwardRef, HTMLAttributes, MouseEvent } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  sublabel?: string;
  description: string;
  leftIcon?: React.ComponentType<HTMLAttributes<SVGElement>>;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

const MenuButton = forwardRef<HTMLButtonElement, Props>(({ className, ...props }, ref) => {
  return (
    <Button
      className={cn("flex h-14 w-full items-center", className)}
      ref={ref}
      variant="ghost"
      onClick={props.onClick}
    >
      <label className="flex flex-col space-y-1 text-start text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        <span>{props.label}</span>
        <div className="flex items-center font-normal leading-snug text-muted-foreground">
          <span className="">{props.description}</span>
          {props.sublabel && <span className="ml-1 font-medium text-primary">{props.sublabel}</span>}
        </div>
      </label>
      {props.leftIcon ? <props.leftIcon className="ml-auto h-4 w-4" /> : <ChevronRight className="ml-auto h-4 w-4" />}
    </Button>
  );
});

export default MenuButton;
