import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Plus, Unlock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFetchXUDTInfo } from "@/hooks/useFetchXUDTInfo";
import { useTokenStore } from "@/stores/token";

const FormSchema = z.object({
  xudtArgs: z.string(),
});

export default function TokenDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fetchXUDTInfo = useFetchXUDTInfo();
  const addToken = useTokenStore((s) => s.addToken);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      xudtArgs: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      setLoading(true);
      const xudtInfo = await fetchXUDTInfo(data.xudtArgs);
      addToken("nervosnetwork", {
        id: xudtInfo.id,
        name: xudtInfo.name,
        symbol: xudtInfo.symbol,
        tokenDecimal: xudtInfo.decimal,
        xudtArgs: xudtInfo.xudtArgs,
        xudtCodeHash: xudtInfo.xudtCodeHash,
        xudtTypeHash: xudtInfo.xudtTypeHash,
      });
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      form.reset({ xudtArgs: "" });
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <Plus className="mr-2 h-6 w-6" />
          {t("dialog.add_token")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialog.custom_token")}</DialogTitle>
          <DialogDescription>{t("dialog.input_xudt_args")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col space-y-4">
            <FormField
              control={form.control}
              name="xudtArgs"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <Button className="w-full" type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("dialog.confirm")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
