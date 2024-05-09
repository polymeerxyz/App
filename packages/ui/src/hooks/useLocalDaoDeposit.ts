import { parseUnit } from "@ckb-lumos/bi";
import { ckb } from "@polymeerxyz/lib";
import { useCallback, useRef } from "react";

import { useActiveAddress } from "@/hooks/useActiveAddress";
import { useDaoService } from "@/hooks/useLib";
import { useLoadPrivateKey } from "@/hooks/useLoadPrivateKey";

export const useLocalDaoDeposit = () => {
  const { full: activeAddress } = useActiveAddress();
  const daoService = useDaoService();
  const loadPrivateKey = useLoadPrivateKey();

  return useCallback(
    async ({ amount }: { amount: string }, feeRate = ckb.FeeRate.NORMAL) => {
      const txSkeleton = await daoService.current.deposit({
        from: activeAddress,
        amount: parseUnit(amount, "ckb"),
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
