import { DaoType, FeeRate } from "@polymeerxyz/lib";
import { useCallback, useRef } from "react";

import { useActiveAddress } from "@/hooks/useActiveAddress";
import { useDaoService, useLedgerDevice } from "@/hooks/useLib";

export const useLedgerDaoUnlock = () => {
  const { full: activeAddress, path } = useActiveAddress();
  const getLedgerDevice = useLedgerDevice();
  const daoService = useDaoService();

  return useCallback(
    async ({ hash }: { hash: string }, feeRate = FeeRate.NORMAL) => {
      const ledgerDevice = await getLedgerDevice();

      const [depositCell, withdrawCell] = await daoService.current.prepareDaoCells(
        { txHash: hash, index: "0x0" },
        DaoType.WITHDRAW,
      );
      const txSkeleton = await daoService.current.unlock({
        depositCell,
        withdrawCell,
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
