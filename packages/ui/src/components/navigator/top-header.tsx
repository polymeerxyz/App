import { ChevronLeft, Lock, Stars, Unlock } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import WalletDialog from "@/components/dialog/wallet-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLockStore } from "@/stores/lock";
import { useWalletStore } from "@/stores/wallet";

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

export default function TopHeader({ className }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lock = useLockStore((s) => s.lock);
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
        <Button
          variant="ghost"
          size="icon"
          className={cn(lock[activeWallet!.id] ? "" : "pointer-events-none")}
          onClick={() => isLocal && navigate("/lock")}
        >
          {lock[activeWallet!.id] ? <Lock /> : <Unlock />}
        </Button>
      ) : (
        <Button variant="ghost" size="icon" className="pointer-events-none">
          <Stars />
        </Button>
      )}
    </div>
  );
}
