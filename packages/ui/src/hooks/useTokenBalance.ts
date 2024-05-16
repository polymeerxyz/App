import { BI } from "@ckb-lumos/bi";
import { useCallback, useMemo, useState } from "react";

import { useActiveAddress } from "@/hooks/useActiveAddress";
import { useCellService, useTransactionService } from "@/hooks/useLib";
import { SupportedToken } from "@/lib/models/token";

export const useTokenBalance = () => {
  const [result, setResult] = useState<{ total: BI; available: BI }>({
    total: BI.from(0),
    available: BI.from(0),
  });
  const { full: activeAddress } = useActiveAddress();
  const cellService = useCellService();

  const fetch = useCallback(
    async (token: SupportedToken) => {
      if (token.id === "ckb") {
        const { availableAmount, collectedSum } = await cellService.current.getNativeCapacity(activeAddress);
        setResult({ total: collectedSum, available: availableAmount });
      } else if (token.xudtArgs) {
        const { availableAmount, collectedAmount } = await cellService.current.getXUDTCapacity(
          activeAddress,
          token.xudtArgs,
        );
        setResult({ total: collectedAmount, available: collectedAmount });
      }
    },
    [activeAddress, cellService],
  );

  return useMemo(() => ({ result, fetch }), [fetch, result]);
};
