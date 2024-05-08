import { DaoType, FeeRate } from "@polymeerxyz/lib";
import { useCallback } from "react";

import { useActiveAddress } from "@/hooks/useActiveAddress";
import { useDaoService, useLedgerDevice } from "@/hooks/useLib";

export const useLedgerDaoWithdraw = () => {
  const { full: activeAddress, path } = useActiveAddress();
  const getLedgerDevice = useLedgerDevice();
  const daoService = useDaoService();

  return useCallback(
    async ({ hash }: { hash: string }, feeRate = FeeRate.NORMAL) => {
      const ledgerDevice = await getLedgerDevice();

      const [depositCell] = await daoService.current.prepareDaoCells({ txHash: hash, index: "0x0" }, DaoType.DEPOSIT);
      const txSkeleton = await daoService.current.withdraw({
        depositCell,
        from: activeAddress,
        feeRate,
      });

      try {
        const tx = await daoService.current.signWithLedger(txSkeleton, ledgerDevice, path);
        await daoService.current.send(tx);
      } catch (error) {
        console.error(error);
      }
    },
    [activeAddress, daoService, getLedgerDevice, path],
  );
};
