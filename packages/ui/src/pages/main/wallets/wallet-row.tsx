import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

import nervosBlack from "@/assets/nervos-token-assets-black.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAddress } from "@/hooks/useAddress";
import { WalletInfo } from "@/lib/models/wallet";
import { useWalletStore } from "@/stores/wallet";

interface Props {
  isActive: boolean;
  wallet: WalletInfo;
}

export function WalletRow({ wallet, isActive }: Props) {
  const navigate = useNavigate();
  const setActiveWalletId = useWalletStore((s) => s.setActiveWalletId);
  const { full } = useAddress(wallet);

  const onClick = () => {
    setActiveWalletId("nervosnetwork", wallet.id);
    navigate("/main/home");
  };

  return (
    <Button className="flex h-14 w-full space-x-2 rounded-md px-4" variant="ghost" onClick={onClick}>
      <Avatar className="h-9 w-9">
        <AvatarImage src={nervosBlack} />
        <AvatarFallback>Nervos</AvatarFallback>
      </Avatar>
      <div className="flex flex-1 flex-col items-start">
        <p className="text-base">{wallet.name}</p>
        <p className="text-xs font-semibold text-muted-foreground">
          {full.slice(0, 24) + "..." + full.slice(full.length - 16)}
        </p>
      </div>
      <div className="flex flex-col items-end">{isActive && <Check className="h-4 w-4 text-green-400" />}</div>
    </Button>
  );
}
