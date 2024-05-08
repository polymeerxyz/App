import { mnemonic } from "@ckb-lumos/hd";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { FormRootError } from "@/components/form/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreatePrivateKey } from "@/hooks/useCreatePrivateKey";
import { useRegisterContext } from "@/pages/register/hook";
import { useWalletStore } from "@/stores/wallet";

const FormSchema = z
  .object({
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
  })
  .refine(
    (data) => {
      const words = Object.keys(data)
        .filter((key) => key !== "name")
        .map((key) => data[key as keyof typeof data]);
      return words.length === 12 && mnemonic.validateMnemonic(words.join(" "));
    },
    {
      message: "Seed phrase is invalid.",
      path: ["form"],
    },
  );

export default function AddSeedPhrasePage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { password } = useRegisterContext();
  const addWallet = useWalletStore((s) => s.addWallet);
  const createPrivateKey = useCreatePrivateKey();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "Main Wallet",
      field_1: "",
      field_2: "",
      field_3: "",
      field_4: "",
      field_5: "",
      field_6: "",
      field_7: "",
      field_8: "",
      field_9: "",
      field_10: "",
      field_11: "",
      field_12: "",
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

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="flex flex-col items-center">
        <CardTitle className="mt-4 text-center">Secret Recover Phrase</CardTitle>
        <CardDescription className="mt-16 text-center">
          To import an existing account, please enter seed phrase.
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
                                className="pl-8 text-base font-medium"
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck={false}
                                pattern="[A-Za-z\s]+"
                                {...field}
                                onPaste={(e) => {
                                  e.preventDefault();
                                  const data = e.clipboardData.getData("text/plain");
                                  const words = data.replace(/\r?\n|\r|\n/g, " ").split(" ");
                                  if (words.length !== 12) return;

                                  form.setValue("field_1", words[0]);
                                  form.setValue("field_2", words[1]);
                                  form.setValue("field_3", words[2]);
                                  form.setValue("field_4", words[3]);
                                  form.setValue("field_5", words[4]);
                                  form.setValue("field_6", words[5]);
                                  form.setValue("field_7", words[6]);
                                  form.setValue("field_8", words[7]);
                                  form.setValue("field_9", words[8]);
                                  form.setValue("field_10", words[9]);
                                  form.setValue("field_11", words[10]);
                                  form.setValue("field_12", words[11]);

                                  e.currentTarget.blur();
                                }}
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
            <FormRootError id="form" />
            <Button className="w-full" type="submit" disabled={!form.formState.isValid || loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
