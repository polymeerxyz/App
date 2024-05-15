import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Unlock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
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
import { useUnlockPrivateKey } from "@/hooks/useUnlockPrivateKey";
import { useLockStore } from "@/stores/lock";
import { useWalletStore } from "@/stores/wallet";

const FormSchema = z.object({
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function LockDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const unlockPrivateKey = useUnlockPrivateKey();
  const lock = useLockStore((s) => s.lock);
  const activeWallet = useWalletStore((s) => s.getActiveWallet("nervosnetwork"));

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      setLoading(true);
      await unlockPrivateKey(activeWallet!.id, data.password);
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" disabled={!lock[activeWallet!.id]} onClick={() => setOpen(true)}>
          {lock[activeWallet!.id] ? <Lock /> : <Unlock />}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialog.unlock_current_wallet")}</DialogTitle>
          <DialogDescription>
            <Trans
              i18nKey="dialog.enter_password_to_unlock"
              values={{ name: activeWallet!.name }}
              components={{ 1: <strong /> }}
            />
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormControl>
                      <Input placeholder={t("dialog.password")} type="password" {...field} />
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
