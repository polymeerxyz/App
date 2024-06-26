import { formatUnit } from "@ckb-lumos/bi";
import { ckb } from "@polymeerxyz/lib";
import { format } from "date-fns";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useGetExplorerLink } from "@/hooks/useGetExplorerLink";
import { SupportedToken } from "@/lib/models/token";

interface Props {
  transaction: ckb.Transaction;
  token: SupportedToken;
}

const getLabel = (type: ckb.TransactionType) => {
  switch (type) {
    case ckb.TransactionType.SEND_NATIVE_TOKEN: {
      return "Send";
    }
    case ckb.TransactionType.SEND_TOKEN: {
      return "Send";
    }
    case ckb.TransactionType.RECEIVE_NATIVE_TOKEN: {
      return "Receive";
    }
    case ckb.TransactionType.RECEIVE_TOKEN: {
      return "Receive";
    }
    case ckb.TransactionType.DEPOSIT_DAO: {
      return "Deposit";
    }
  }
};

export function TransactonRow({ transaction, token }: Props) {
  const isPositive =
    transaction.type === ckb.TransactionType.RECEIVE_NATIVE_TOKEN ||
    transaction.type === ckb.TransactionType.RECEIVE_TOKEN;

  const explorerLink = useGetExplorerLink(transaction.hash, "transaction");

  return (
    <Button className="flex h-14 w-full items-center rounded-md px-4" variant="ghost" asChild>
      <Link to={explorerLink} target="_blank">
        <label className="flex flex-col space-y-1 text-start text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          <span>{getLabel(transaction.type)}</span>
          <span className="font-normal leading-snug text-muted-foreground">{format(transaction.timestamp, "P")}</span>
        </label>
        <span className="ml-auto">
          {(isPositive ? "+ " : "- ") + `${formatUnit(transaction.amount, token.tokenDecimal)} ${token.symbol}`}
        </span>
      </Link>
    </Button>
  );
}
