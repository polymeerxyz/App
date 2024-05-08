import { Dao } from "@polymeerxyz/lib";
import { useCallback, useMemo, useState } from "react";

import { useActiveAddress } from "@/hooks/useActiveAddress";
import { useDaoService } from "@/hooks/useLib";

export const useDaoList = () => {
  const [result, setResult] = useState<Dao[]>([]);
  const { full: activeAddress } = useActiveAddress();
  const daoService = useDaoService();

  const fetch = useCallback(async () => {
    const daos = await daoService.current.list(activeAddress);
    setResult(daos);
  }, [activeAddress, daoService]);

  return useMemo(() => ({ result, fetch }), [fetch, result]);
};
