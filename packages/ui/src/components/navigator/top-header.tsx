import { ChevronLeft, Stars } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import LockDialog from "@/components/dialog/lock-dialog";
import WalletDialog from "@/components/dialog/wallet-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWalletStore } from "@/stores/wallet";

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

export default function TopHeader({ className }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeWallet = useWalletStore((s) => s.getActiveWallet("nervosnetwork"));

  const isLocal = useMemo(
    () => activeWallet!.type === "private-key" || activeWallet!.type === "mnemonic",
    [activeWallet],
  );

  return (
    <div
      className={cn(
        "fixed top-0 flex h-16 w-full max-w-[800px] items-center justify-between border-b bg-card px-4",
        className,
      )}
    >
      <div className="absolute bottom-0 left-20 right-20 top-0 flex flex-col items-center justify-center">
        <WalletDialog />
      </div>
      {searchParams.get("withBack") === "true" ? (
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
      ) : (
        <div />
      )}
      {isLocal ? (
        <LockDialog />
      ) : (
        <Button variant="ghost" size="icon" className="pointer-events-none">
          <Stars />
        </Button>
      )}
    </div>
  );
}
