import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DoOnboardingPage() {
  const navigate = useNavigate();

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="flex flex-col items-center">
        <CardTitle className="mt-4 text-center">Polymeer Wallet</CardTitle>
        <CardDescription className="mt-16 text-center">Choose an option to get started.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <Button onClick={() => navigate("/register/create-password?type=generate")}>Create a new wallet</Button>
        <Button variant="secondary" onClick={() => navigate("/register/create-password?type=import")}>
          Import an existing wallet
        </Button>
        <Button variant="ghost" onClick={() => navigate("/register/connect-hardware-wallet")}>
          Connect a Hardware wallet
        </Button>
      </CardContent>
    </Card>
  );
}
