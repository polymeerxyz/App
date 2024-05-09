import { parseUnit } from "@ckb-lumos/bi";
import { TransactionSkeletonType } from "@ckb-lumos/helpers";
import { ckb } from "@polymeerxyz/lib";
import { useCallback } from "react";

import { useActiveAddress } from "@/hooks/useActiveAddress";
import { useLedgerDevice, useTransactionService } from "@/hooks/useLib";
import { SupportedToken } from "@/lib/models/token";

export const useLedgerTransfer = () => {
  const { full: activeAddress, path } = useActiveAddress();
  const getLedgerDevice = useLedgerDevice();
  const transactionService = useTransactionService();

  return useCallback(
    async (
      { token, to, amount }: { token: SupportedToken; to: string; amount: string },
      feeRate = ckb.FeeRate.NORMAL,
      feeType: ckb.FeeType = "sender",
    ) => {
      const ledgerDevice = await getLedgerDevice();

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

      try {
        const tx = await transactionService.current.signWithLedger(txSkeleton, ledgerDevice, path);
        await transactionService.current.send(tx);
      } catch (error) {
        console.error(error);
      }
    },
    [activeAddress, getLedgerDevice, path, transactionService],
  );
};
