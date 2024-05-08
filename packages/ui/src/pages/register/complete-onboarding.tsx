import { PartyPopper } from "lucide-react";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { closeTab, getCurrentTab } from "@/lib/utils/extension";

export default function CompleteOnboardingPage() {
  const onSubmit = useCallback(async () => {
    const currentTab = await getCurrentTab();
    await closeTab(currentTab.id!);
  }, []);

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="flex flex-col items-center">
        <CardTitle className="mt-4 text-center">You're all done</CardTitle>
        <CardDescription className="mt-16 text-center">You can now fully enjoy your wallet</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <PartyPopper className="h-16 w-16 animate-pulse self-center" />
        <Button className="w-full" onClick={onSubmit}>
          Get started
        </Button>
      </CardContent>
    </Card>
  );
}
