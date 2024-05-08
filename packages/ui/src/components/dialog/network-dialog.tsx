import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import MenuButton from "@/components/button/menu-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNetworkStore } from "@/stores/network";

const FormSchema = z.object({
  url: z.string(),
  type: z.enum(["mainnet", "testnet"]),
});

export default function NetworkDialog() {
  const { rpcUrl, type } = useNetworkStore((s) => s.config.nervosnetwork);
  const setNetworkInfo = useNetworkStore((s) => s.setNetworkInfo);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      url: rpcUrl,
      type,
    },
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof FormSchema>) => {
      setNetworkInfo("nervosnetwork", {
        rpcUrl: data.url,
        type: data.type,
      });
    },
    [setNetworkInfo],
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <MenuButton
          label="Networks"
          sublabel={`(${type === "mainnet" ? "Mainnet" : "Testnet"})`}
          description="Configure wallet network"
        />
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col space-y-4">
            <DialogHeader>
              <DialogTitle>Wallet network</DialogTitle>
              <DialogDescription>Choose another RPC provider</DialogDescription>
            </DialogHeader>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select network type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mainnet">Mainnet</SelectItem>
                        <SelectItem value="testnet">Testnet</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name={"url"}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>RPC Url</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button className="w-full" type="submit">
                  Change
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
