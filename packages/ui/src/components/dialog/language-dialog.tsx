import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supportedLanguages } from "@/translations/i18n";

const FormSchema = z.object({
  language: z.string(),
});

export default function LanguageDialog() {
  const { i18n, t } = useTranslation();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      language: i18n.language,
    },
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof FormSchema>) => {
      i18n.changeLanguage(data.language);
    },
    [i18n],
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <MenuButton
          label={t("settings.languages")}
          sublabel={`(${i18n.language.toUpperCase()})`}
          description={t("settings.choose_another_display_language")}
        />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialog.wallet_language")}</DialogTitle>
          <DialogDescription>{t("dialog.choose_another_language")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col space-y-4">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>{t("dialog.language")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("dialog.select_language_to_display")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {supportedLanguages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                );
              }}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button className="w-full" type="submit">
                  {t("dialog.change")}
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
