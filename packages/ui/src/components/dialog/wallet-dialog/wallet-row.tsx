import { Check } from "lucide-react";

import nervosBlack from "@/assets/nervos-token-assets-black.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAddress } from "@/hooks/useAddress";
import { WalletInfo } from "@/lib/models/wallet";
import { cn } from "@/lib/utils";
import { useWalletStore } from "@/stores/wallet";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  wallet: WalletInfo;
}

export function WalletRow({ onClick, wallet }: Props) {
  const { full } = useAddress(wallet);
  const { activeWalletId } = useWalletStore((s) => s.wallet.nervosnetwork);

  const isActive = wallet.id === activeWalletId;

  return (
    <Button
      className={cn("flex h-fit items-center justify-between rounded-md px-4", isActive ? "pointer-events-none" : "")}
      variant="ghost"
      onClick={onClick}
    >
      <div className="flex items-center">
        <Avatar className="mr-2 h-9 w-9">
          <AvatarImage src={nervosBlack} />
          <AvatarFallback>Nervos</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start whitespace-pre-wrap break-all text-left">
          <p className="w-full text-base">{wallet.name}</p>
          <p className="w-full text-xs font-semibold text-muted-foreground">{full}</p>
        </div>
      </div>
      <div className="ml-2 h-6 w-6">{isActive && <Check className="h-4 w-4 text-green-400" />}</div>
    </Button>
  );
}
