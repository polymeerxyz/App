import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUnlockPrivateKey } from "@/hooks/useUnlockPrivateKey";
import { useWalletStore } from "@/stores/wallet";

const FormSchema = z.object({
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function LockPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const unlockPrivateKey = useUnlockPrivateKey();
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
      navigate(-1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen min-h-[600px] min-w-[400px] flex-col items-center justify-center bg-background">
      <Card className="flex h-full max-h-[960px] w-full max-w-[800px] flex-col rounded-none bg-card">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="mt-4 text-center">Welcome back!</CardTitle>
          <CardDescription className="mt-16 text-center">
            {`Enter your password to unlock `}
            <strong>{activeWallet!.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center">
            <LockKeyhole className="h-16 w-16 animate-pulse" />
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col space-y-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Password" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <Button className="w-full" type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
