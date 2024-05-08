import { HelpCircle, Home } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { openTab } from "@/lib/utils/extension";

export default function FullLayout() {
  return (
    <div className="flex h-screen flex-col">
      <header className="absolute left-0 right-0 top-0 flex justify-between p-8">
        <Button
          variant="ghost"
          asChild
          onClick={(e) => {
            e.preventDefault();
            openTab({ url: "https://polymeer.xyz" });
          }}
        >
          <Link to="https://polymeer.xyz">
            <Home />
          </Link>
        </Button>
        <Button
          variant="ghost"
          asChild
          onClick={(e) => {
            e.preventDefault();
            openTab({ url: "https://polymeer.xyz/guides" });
          }}
        >
          <Link to="https://polymeer.xyz/guides">
            <HelpCircle className="mr-2" />
            Help
          </Link>
        </Button>
      </header>
      <div className="flex flex-1 flex-col justify-center bg-background">
        <Outlet />
      </div>
    </div>
  );
}
