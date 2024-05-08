import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
      <Separator className="mx-auto w-3/5" />
      <div className="flex flex-col space-y-2">
        <TokenRow token={native} />
        {tokens.map((el) => (
          <TokenRow key={el.address} token={el} />
        ))}
      </div>
      <Button className="w-full" variant="outline" onClick={() => {}}>
        Add token
      </Button>
    </div>
  );
}
