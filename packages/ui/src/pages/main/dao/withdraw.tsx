import { DaoType, FeeRate } from "@polymeerxyz/lib";
import { ExternalLink, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import nervosBlack from "@/assets/nervos-token-assets-black.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useGetExplorerLink } from "@/hooks/useGetExplorerLink";
import { useLedgerDaoUnlock } from "@/hooks/useLedgerDaoUnlock";
import { useLedgerDaoWithdraw } from "@/hooks/useLedgerDaoWithdraw";
import { useLocalDaoUnlock } from "@/hooks/useLocalDaoUnlock";
import { useLocalDaoWithdraw } from "@/hooks/useLocalDaoWithdraw";
import { toReadableAmount } from "@/lib/utils/amount";
import { useLockStore } from "@/stores/lock";
import { useWalletStore } from "@/stores/wallet";

export default function WithdrawPage() {
  const [loading, setLoading] = useState(false);
  const lock = useLockStore((s) => s.lock);
  const activeWallet = useWalletStore((s) => s.getActiveWallet("nervosnetwork"));
  const ledgerDaoUnlock = useLedgerDaoUnlock();
  const localDaoUnlock = useLocalDaoUnlock();
  const ledgerDaoWithdraw = useLedgerDaoWithdraw();
  const localDaoWithdraw = useLocalDaoWithdraw();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isLocal = useMemo(
    () => activeWallet!.type === "private-key" || activeWallet!.type === "mnemonic",
    [activeWallet],
  );

  const hash = useMemo(() => searchParams.get("hash"), [searchParams]);
  const explorerLink = useGetExplorerLink(searchParams.get("hash") ?? "", "transaction");

  useEffect(() => {
    if (!hash) navigate(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onUnlockClick = useCallback(async () => {
    try {
      setLoading(true);
      if (isLocal) {
        await localDaoUnlock({ hash: hash! }, FeeRate.NORMAL);
      } else {
        await ledgerDaoUnlock({ hash: hash! }, FeeRate.NORMAL);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [hash, isLocal, ledgerDaoUnlock, localDaoUnlock]);

  const onWithdrawClick = useCallback(async () => {
    try {
      setLoading(true);
      if (isLocal) {
        await localDaoWithdraw({ hash: hash! }, FeeRate.NORMAL);
      } else {
        await ledgerDaoWithdraw({ hash: hash! }, FeeRate.NORMAL);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [hash, isLocal, ledgerDaoWithdraw, localDaoWithdraw]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-col space-y-4 p-4">
        <div className="flex items-center space-x-2">
          <Avatar className="h-12 w-12">
            <AvatarImage src={nervosBlack} />
            <AvatarFallback>CKB</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col items-start space-y-1">
            <p className="text-lg font-semibold">CKB</p>
            <p className="text-sm">{`${toReadableAmount(searchParams.get("amount") ?? "0")} CKB`}</p>
          </div>
          <Button size="icon" variant="ghost" asChild>
            <Link target="_blank" to={explorerLink}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        {searchParams.get("type") === DaoType.DEPOSIT.toString() && (
          <Button variant="destructive" disabled={loading || lock[activeWallet!.id]} onClick={onWithdrawClick}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Withdraw
          </Button>
        )}
        {searchParams.get("type") === DaoType.WITHDRAW.toString() && (
          <Button disabled={loading || lock[activeWallet!.id]} onClick={onUnlockClick}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Unlock
          </Button>
        )}
      </div>
    </div>
  );
}
