import { BI, formatUnit } from "@ckb-lumos/bi";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useTokenPrice } from "@/hooks/useTokenPrice";
import { SupportedToken } from "@/lib/models/token";
import { formatCurrency, mulPrice } from "@/lib/utils/amount";

interface Props {
  token: SupportedToken;
}

export function TokenRow({ token }: Props) {
  const navigate = useNavigate();
  const { fetch: fetchBalance, result: balance } = useTokenBalance();
  const { fetch: fetchPrice, result: price } = useTokenPrice();

  useEffect(() => {
    fetchBalance(token);
    fetchPrice(token);
  }, [fetchBalance, fetchPrice, token]);

  const onClick = () => {
    navigate(`/main/token/${token.id}?withBack=true`);
  };

  return (
    <Button className="flex h-14 w-full space-x-2 rounded-md px-4" variant="ghost" onClick={onClick}>
      <Avatar className="h-9 w-9">
        <AvatarImage src={token.logoURI} />
        <AvatarFallback>{token.symbol.toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-1 flex-col items-start">
        <p className="text-base">{token.symbol.toUpperCase()}</p>
        <p className="text-xs font-semibold text-muted-foreground">{formatCurrency(price ?? 0, 4)}</p>
      </div>
      <div className="flex flex-col items-end">
        <p className="text-base">{formatUnit(balance.total, token.tokenDecimal)}</p>
        <p className="text-xs font-semibold text-muted-foreground">
          {formatCurrency(mulPrice(price ?? 0, BI.from(balance.total).div(BI.from(10 ** token.tokenDecimal))))}
        </p>
      </div>
    </Button>
  );
}
