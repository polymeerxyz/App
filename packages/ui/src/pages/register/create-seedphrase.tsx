import { mnemonic } from "@ckb-lumos/hd";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Loader2 } from "lucide-react";
import { MouseEvent, useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useCopyToClipboard } from "react-use";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreatePrivateKey } from "@/hooks/useCreatePrivateKey";
import { cn } from "@/lib/utils";
import { useRegisterContext } from "@/pages/register/hook";
import { useWalletStore } from "@/stores/wallet";

const FormSchema = z.object({
  name: z.string(),
  field_1: z.string(),
  field_2: z.string(),
  field_3: z.string(),
  field_4: z.string(),
  field_5: z.string(),
  field_6: z.string(),
  field_7: z.string(),
  field_8: z.string(),
  field_9: z.string(),
  field_10: z.string(),
  field_11: z.string(),
  field_12: z.string(),
});

export default function CreateSeedPhrasePage() {
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { password } = useRegisterContext();
  const addWallet = useWalletStore((s) => s.addWallet);
  const [_, copy] = useCopyToClipboard();
  const createPrivateKey = useCreatePrivateKey();

  const walletMnemonic = useMemo(() => mnemonic.generateMnemonic().split(" "), []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "Main Wallet",
      field_1: walletMnemonic[0],
      field_2: walletMnemonic[1],
      field_3: walletMnemonic[2],
      field_4: walletMnemonic[3],
      field_5: walletMnemonic[4],
      field_6: walletMnemonic[5],
      field_7: walletMnemonic[6],
      field_8: walletMnemonic[7],
      field_9: walletMnemonic[8],
      field_10: walletMnemonic[9],
      field_11: walletMnemonic[10],
      field_12: walletMnemonic[11],
    },
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof FormSchema>) => {
      if (password.length === 0) return;

      setLoading(true);
      const { id, serializedAccountExtendedPublicKey } = await createPrivateKey(
        [
          data.field_1,
          data.field_2,
          data.field_3,
          data.field_4,
          data.field_5,
          data.field_6,
          data.field_7,
          data.field_8,
          data.field_9,
          data.field_10,
          data.field_11,
          data.field_12,
        ].join(" "),
        password,
      );
      addWallet("nervosnetwork", { id, name: data.name, serializedAccountExtendedPublicKey, type: "mnemonic" });
      setLoading(false);
      navigate("/register/complete-onboarding");
    },
    [addWallet, createPrivateKey, navigate, password],
  );

  const onCopy = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      copy(walletMnemonic.join(" "));
      setCopied(true);

      const timeout = setTimeout(() => {
        setCopied(false);
      }, 5_000);

      return () => {
        clearTimeout(timeout);
      };
    },
    [copy, walletMnemonic],
  );

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="flex flex-col items-center">
        <CardTitle className="mt-4 text-center">Secret Recover Phrase</CardTitle>
        <CardDescription className="mt-16 text-center">
          Keep your seed phrase in a safe place and never disclose it. Anyone with this phrase can take control of your
          assets.
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
            <div className="grid grid-cols-3 gap-2">
              {[
                "field_1",
                "field_2",
                "field_3",
                "field_4",
                "field_5",
                "field_6",
                "field_7",
                "field_8",
                "field_9",
                "field_10",
                "field_11",
                "field_12",
              ].map((name, index) => {
                return (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name as any}
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormControl>
                            <div className="flex flex-row items-center">
                              <Label className="absolute pl-2 text-base font-light">{`${index + 1}.`}</Label>
                              <Input
                                className="pointer-events-none pl-8 text-base font-medium"
                                readOnly
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck={false}
                                pattern="[A-Za-z\s]+"
                                {...field}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                );
              })}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                copied ? "pointer-events-none text-green-600 hover:bg-transparent hover:text-green-600" : "",
              )}
              onClick={onCopy}
            >
              <Copy className="mr-2 h-4 w-4" />
              {copied ? "Copied" : "Copy to the clipboard"}
            </Button>
            <div className="flex items-center space-x-2">
              <Checkbox
                defaultChecked={false}
                onCheckedChange={(e) => {
                  const isChecked = typeof e === "boolean" ? e : false;
                  setDisabled(!isChecked);
                }}
              />
              <label className="text-sm" htmlFor="acknowledge">
                I have saved the seed phrase
              </label>
            </div>
            <Button className="w-full" type="submit" disabled={disabled || loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
