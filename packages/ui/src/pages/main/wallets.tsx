import { Button } from "@/components/ui/button";
import { openTab } from "@/lib/utils/extension";
import { WalletRow } from "@/pages/main/wallets/wallet-row";
import { useWalletStore } from "@/stores/wallet";

export default function WalletsPage() {
  const { activeWalletId, wallets } = useWalletStore((s) => s.wallet.nervosnetwork);

  const onClick = () => {
    openTab({ url: "index.html#/register/do-onboarding" });
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between p-4">
        <p className="text-lg font-medium">{`Total: ${wallets.length} wallet(s)`}</p>
        <Button className="self-end rounded-full" variant="outline" onClick={onClick}>
          Add wallet
        </Button>
      </div>
      <div className="flex flex-col space-y-2 p-4">
        {wallets.map((el) => {
          return <WalletRow key={el.id} wallet={el} isActive={activeWalletId === el.id} />;
        })}
      </div>
    </div>
  );
}
