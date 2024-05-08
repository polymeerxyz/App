import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLedgerDevice } from "@/hooks/useLib";
import { useWalletStore } from "@/stores/wallet";

const FormSchema = z.object({
  name: z.string(),
});

export default function ConnectHardwareWalletPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const getLedgerDevice = useLedgerDevice();
  const addWallet = useWalletStore((s) => s.addWallet);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "Ledger Wallet",
    },
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof FormSchema>) => {
      setLoading(true);
      const ledgerDevice = await getLedgerDevice();

      const serializedAccountExtendedPublicKey = await ledgerDevice.getAccountExtendedPublicKey();

      addWallet("nervosnetwork", {
        id: uuidv4(),
        name: data.name,
        serializedAccountExtendedPublicKey,
        type: "ledger",
      });

      // console.log(
      //   publicKey,
      //   publicKeyToAddress(new AccountExtendedPublicKey(publicKey, chainCode), AddressType.Receiving, 0, ckb.config),
      //   publicKeyToAddress(
      //     new AccountExtendedPublicKey(compressPublicKey(longPublicKey), chainCode),
      //     AddressType.Receiving,
      //     0,
      //     ckb.config,
      //   ),
      //   address,
      // );

      setLoading(false);
      navigate("/register/complete-onboarding");
    },
    [addWallet, getLedgerDevice, navigate],
  );

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="flex flex-col items-center">
        <CardTitle className="mt-4 text-center">Connect your Ledger</CardTitle>
        <CardDescription className="mt-16 text-center">
          Click the button below to start connecting your Ledger hardware wallet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                );
              }}
            />
            <Button className="w-full" type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get started
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
