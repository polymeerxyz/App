import { parseUnit } from "@ckb-lumos/bi";
import { FeeRate } from "@polymeerxyz/lib";
import { useCallback, useRef } from "react";

import { useActiveAddress } from "@/hooks/useActiveAddress";
import { useDaoService, useLedgerDevice } from "@/hooks/useLib";

export const useLedgerDaoDeposit = () => {
  const { full: activeAddress, path } = useActiveAddress();
  const getLedgerDevice = useLedgerDevice();
  const daoService = useDaoService();

  return useCallback(
    async ({ amount }: { amount: string }, feeRate = FeeRate.NORMAL) => {
      const ledgerDevice = await getLedgerDevice();

      const txSkeleton = await daoService.current.deposit({
        from: activeAddress,
        amount: parseUnit(amount, "ckb"),
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
