import { useCallback } from "react";

import { useXUDTService } from "@/hooks/useLib";

export const useFetchXUDTInfo = () => {
  const xudtService = useXUDTService();

  return useCallback(
    async (xudtArgs: string) => {
      return await xudtService.current.getXUDTInfo(xudtArgs);
    },
    [xudtService],
  );
};
