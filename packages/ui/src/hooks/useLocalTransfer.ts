import { parseUnit } from "@ckb-lumos/bi";
import { TransactionSkeletonType } from "@ckb-lumos/helpers";
import { FeeRate, FeeType } from "@polymeerxyz/lib";
import { useCallback } from "react";

import { useActiveAddress } from "@/hooks/useActiveAddress";
import { useTransactionService } from "@/hooks/useLib";
import { useLoadPrivateKey } from "@/hooks/useLoadPrivateKey";
import { SupportedToken } from "@/lib/models/token";

export const useLocalTransfer = () => {
  const { full: activeAddress } = useActiveAddress();
  const transactionService = useTransactionService();
  const loadPrivateKey = useLoadPrivateKey();

  return useCallback(
    async (
      { token, to, amount }: { token: SupportedToken; to: string; amount: string },
      feeRate = FeeRate.NORMAL,
      feeType: FeeType = "sender",
    ) => {
      let txSkeleton: TransactionSkeletonType;
      if (token.address === "ckb") {
        txSkeleton = await transactionService.current.transfer({
          from: activeAddress,
          to,
          amount: parseUnit(amount, "ckb"),
          feeBearer: feeType === "sender" ? activeAddress : to,
          feeRate,
        });
      } else {
        txSkeleton = await transactionService.current.transferXUDT({
          xudtArgs: token.xudtArgs!,
          from: activeAddress,
          to,
          amount: parseUnit(amount, token.tokenDecimal),
          feeBearer: feeType === "sender" ? activeAddress : to,
          feeRate,
        });
      }

      const privateKey = await loadPrivateKey();

      try {
        const tx = await transactionService.current.signWithPrivateKeys(txSkeleton, [privateKey]);
        await transactionService.current.send(tx);
      } catch (error) {
        console.log(error);
      }
    },
    [activeAddress, loadPrivateKey, transactionService],
  );
};
