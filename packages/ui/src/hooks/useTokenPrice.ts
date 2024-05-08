import axios from "axios";
import { useCallback, useMemo, useState } from "react";

import { SupportedToken } from "@/lib/models/token";

// TODO: Support multiple currency
const currency = "usd";

export const useTokenPrice = () => {
  const [price, setPrice] = useState(0);

  const fetch = useCallback(async (token: SupportedToken) => {
    if (token.address === "ckb") {
      const { data } = await axios.get<{ market_data: { current_price: { [currency: string]: number } } }>(
        "https://api.coingecko.com/api/v3/coins/nervos-network",
      );
      setPrice(data.market_data.current_price[currency]);
    } else {
      const { data } = await axios.get<{ data: { usdPrice: string } }>(
        `https://huehub.xyz/huehub/api/v1/rgbpp/token/info?xudtTypeHash=${token.xudtTypeHash ?? ""}`,
      );
      setPrice(Number(data.data.usdPrice));
    }
  }, []);

  return useMemo(() => ({ result: price, fetch }), [price, fetch]);
};
