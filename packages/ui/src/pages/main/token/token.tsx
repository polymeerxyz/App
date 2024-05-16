import { formatUnit } from "@ckb-lumos/bi";
import { ArrowDownCircle, ArrowUpCircle, Link2 } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useActiveAddress } from "@/hooks/useActiveAddress";
import { useGetExplorerLink } from "@/hooks/useGetExplorerLink";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import { TransactonRow } from "@/pages/main/token/transaction-row";

export default function TokenPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { balance, token, transactions, fetch: fetchInfo } = useTokenInfo(params.id!, true);

  const { full: activeAddress } = useActiveAddress();
  const explorerLink = useGetExplorerLink(
    token?.id === "ckb" ? activeAddress : token?.id,
    token?.id === "ckb" ? "address" : "xudt",
  );

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  return token ? (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center space-x-2">
        <Avatar className="h-12 w-12">
          <AvatarImage src={token.logoURI} />
          <AvatarFallback>{token.symbol.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col items-start space-y-1">
          <p className="text-lg font-semibold">{token.name}</p>
          <p className="text-sm">{`${formatUnit(balance.total, token!.tokenDecimal)} ${token.symbol.toUpperCase()}`}</p>
        </div>
      </div>
      {token.symbol === "CKB" && (
        <div className="rounded-lg bg-secondary-foreground/85 p-2 text-xs text-secondary">
          <div className="flex flex-1 justify-between">
            <p>Available</p>
            <p className="font-medium">{`${formatUnit(balance.available, token!.tokenDecimal)} ${token.symbol.toUpperCase()}`}</p>
          </div>
          <div className="flex flex-1 justify-between">
            <p>Occupied</p>
            <p className="font-medium">{`${formatUnit(balance.total.sub(balance.available), token!.tokenDecimal)} ${token.symbol.toUpperCase()}`}</p>
          </div>
        </div>
      )}
      <div className="flex space-x-2">
        <Button className="w-full" onClick={() => navigate("send?withBack=true")}>
          <ArrowUpCircle className="mr-2 h-6 w-6" />
          Send
        </Button>
        <Button className="w-full" variant="secondary" onClick={() => navigate("receive?withBack=true")}>
          <ArrowDownCircle className="mr-2 h-6 w-6" />
          Receive
        </Button>
        <Button className="w-full" variant="secondary" asChild>
          <Link to={explorerLink} target="_blank">
            <Link2 className="mr-2 h-6 w-6" />
            Explorer
          </Link>
        </Button>
      </div>
      <div className="flex flex-col space-y-2">
        {transactions.map((transaction) => (
          <TransactonRow key={transaction.hash} transaction={transaction} token={token} />
        ))}
      </div>
    </div>
  ) : null;
}
