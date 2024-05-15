import { useState } from "react";
import { useTranslation } from "react-i18next";

import { WalletRow } from "@/components/dialog/wallet-dialog/wallet-row";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { closeTab, getCurrentTab, openTab } from "@/lib/utils/extension";
import { useWalletStore } from "@/stores/wallet";

export default function WalletDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { wallets } = useWalletStore((s) => s.wallet.nervosnetwork);
  const activeWallet = useWalletStore((s) => s.getActiveWallet("nervosnetwork"));
  const setActiveWalletId = useWalletStore((s) => s.setActiveWalletId);

  const onAddClick = async () => {
    await openTab({ url: "index.html#/register/do-onboarding" });
    const currentTab = await getCurrentTab();
    if (currentTab) await closeTab(currentTab.id!);
  };

  const onWalletClick = (id: string) => {
    setActiveWalletId("nervosnetwork", id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          {activeWallet!.name}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex w-full flex-col space-y-4">
        <DialogHeader>
          <DialogTitle>{t("dialog.wallet_language")}</DialogTitle>
          <DialogDescription>{`Total: ${wallets.length} wallet(s)`}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-2">
          {wallets.map((el) => (
            <WalletRow key={el.id} wallet={el} onClick={() => onWalletClick(el.id)} />
          ))}
        </div>
        <DialogFooter>
          <Button className="w-full" variant="outline" onClick={onAddClick}>
            Add wallet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
