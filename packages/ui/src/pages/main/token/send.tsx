import { parseUnit } from "@ckb-lumos/bi";
import { zodResolver } from "@hookform/resolvers/zod";
import { ckb } from "@polymeerxyz/lib";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLedgerTransfer } from "@/hooks/useLedgerTransfer";
import { useLocalTransfer } from "@/hooks/useLocalTransfer";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import { toReadableAmount } from "@/lib/utils/amount";
import { useLockStore } from "@/stores/lock";
import { useWalletStore } from "@/stores/wallet";

const css = `
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
`;

const FormSchema = z.object({
  receiver: z.string(),
  amount: z.string(),
});

export default function SendPage() {
  const [loading, setLoading] = useState(false);
  const lock = useLockStore((s) => s.lock);
  const activeWallet = useWalletStore((s) => s.getActiveWallet("nervosnetwork"));
  const params = useParams();
  const { balance, token } = useTokenInfo(params.id!);
  const ledgerTransfer = useLedgerTransfer();
  const localTransfer = useLocalTransfer();

  const isLocal = useMemo(
    () => activeWallet!.type === "private-key" || activeWallet!.type === "mnemonic",
    [activeWallet],
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      receiver: "",
      amount: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      setLoading(true);
      if (isLocal) {
        await localTransfer(
          {
            token: token!,
            to: data.receiver,
            amount: data.amount,
          },
          ckb.FeeRate.NORMAL,
          balance.available.eq(parseUnit(data.amount, "ckb")) ? "receiver" : "sender",
        );
      } else {
        await ledgerTransfer(
          {
            token: token!,
            to: data.receiver,
            amount: data.amount,
          },
          ckb.FeeRate.NORMAL,
          balance.available.eq(parseUnit(data.amount, "ckb")) ? "receiver" : "sender",
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col p-4">
      <style>{css}</style>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col space-y-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="receiver"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Receiver</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <div className="!mt-1 flex">
                      <Button
                        className="ml-auto h-4 text-xs text-destructive/80"
                        variant="link"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          form.setValue("amount", toReadableAmount(balance.available));
                        }}
                      >
                        {`Max: ${toReadableAmount(balance.available)} ${token?.symbol ?? ""}`}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
          <Button className="w-full" type="submit" disabled={loading || lock[activeWallet!.id]}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send
          </Button>
        </form>
      </Form>
    </div>
  );
}
