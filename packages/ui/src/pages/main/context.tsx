import { createContext, PropsWithChildren, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useFetchXUDTs } from "@/hooks/useFetchXUDTs";
import { useReloadLockKey } from "@/hooks/useReloadLockKey";
import { useWalletStore } from "@/stores/wallet";

interface MainContextType {}

export const MainContext = createContext<MainContextType>({} as any);

export const MainContextProvider = (props: PropsWithChildren) => {
  const fetchXUDTs = useFetchXUDTs();
  const reloadLockKey = useReloadLockKey();
  const activeWallet = useWalletStore((s) => s.getActiveWallet("nervosnetwork"));

  useEffect(() => {
    fetchXUDTs("nervosnetwork");
  }, [fetchXUDTs]);

  useEffect(() => {
    reloadLockKey();

    const interval = setInterval(() => {
      reloadLockKey();
    }, 5_000);
    return () => clearInterval(interval);
  }, [reloadLockKey]);

  return !activeWallet ? (
    <div className="flex max-h-[600px] min-h-[600px] min-w-[400px] max-w-[400px] flex-col items-center justify-center space-y-4 border">
      <p className="text-base font-medium text-accent-foreground">Wallet not found</p>
      <Button onClick={() => window.location.reload()}>Reload</Button>
    </div>
  ) : (
    <MainContext.Provider value={{}}>{props.children}</MainContext.Provider>
  );
};
