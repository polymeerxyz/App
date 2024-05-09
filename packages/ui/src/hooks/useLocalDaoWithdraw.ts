import { ckb } from "@polymeerxyz/lib";
import { useCallback } from "react";

import { useActiveAddress } from "@/hooks/useActiveAddress";
import { useDaoService } from "@/hooks/useLib";
import { useLoadPrivateKey } from "@/hooks/useLoadPrivateKey";

export const useLocalDaoWithdraw = () => {
  const { full: activeAddress } = useActiveAddress();
  const daoService = useDaoService();
  const loadPrivateKey = useLoadPrivateKey();

  return useCallback(
    async ({ hash }: { hash: string }, feeRate = ckb.FeeRate.NORMAL) => {
      const [depositCell] = await daoService.current.prepareDaoCells(
        { txHash: hash, index: "0x0" },
        ckb.DaoType.DEPOSIT,
      );
      const txSkeleton = await daoService.current.withdraw({
        depositCell,
        from: activeAddress,
        feeRate,
      });

      const privateKey = await loadPrivateKey();

      try {
        const tx = await daoService.current.signWithPrivateKeys(txSkeleton, [privateKey]);
        await daoService.current.send(tx);
      } catch (error) {
        console.log(error);
      }
    },
    [activeAddress, daoService, loadPrivateKey],
  );
};
