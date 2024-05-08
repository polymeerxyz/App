import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRegisterContext } from "@/pages/register/hook";

const FormSchema = z
  .object({
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );

export default function CreatePasswordPage() {
  const [disabled, setDisabled] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updatePassword } = useRegisterContext();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    updatePassword(data.password);
    const type = searchParams.get("type");
    if (type === "generate") {
      navigate("/register/create-seedphrase");
    } else if (type === "import") {
      navigate("/register/add-seedphrase");
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="flex flex-col items-center">
        <CardTitle className="mt-4 text-center">Create Password</CardTitle>
        <CardDescription className="mt-16 text-center">You need to create a password for your wallet</CardDescription>
      </CardHeader>
      <CardContent>
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Confirm Password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                defaultChecked={false}
                onCheckedChange={(e) => {
                  const isChecked = typeof e === "boolean" ? e : false;
                  setDisabled(!isChecked);
                }}
              />
              <label
                htmlFor="terms"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {"I agree to the "}
                <Button variant="link" asChild className="p-0">
                  <Link to="/terms-of-service">Terms of Service</Link>
                </Button>
              </label>
            </div>
            <Button className="w-full" type="submit" disabled={disabled}>
              Continue
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
