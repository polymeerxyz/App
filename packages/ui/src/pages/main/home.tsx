import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TokenRow } from "@/pages/main/home/token-row";
import { useTokenStore } from "@/stores/token";

export default function HomePage() {
  const { tokens, native } = useTokenStore((s) => s.token.nervosnetwork);

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-semibold">$0.00</p>
        <div className="flex space-x-1 text-green-400">
          <p className="text-sm font-semibold">+$0.00</p>
          <p className="text-sm font-semibold">+0.00%</p>
        </div>
      </div>
      <Button className="w-full" variant="outline" onClick={() => {}}>
        <Plus className="mr-2 h-6 w-6" />
        Add token
      </Button>
      <div className="flex flex-col space-y-2">
        <TokenRow token={native} />
        {tokens.map((el) => (
          <TokenRow key={el.address} token={el} />
        ))}
      </div>
    </div>
  );
}
