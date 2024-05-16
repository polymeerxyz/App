import TokenDialog from "@/components/dialog/token-dialog";
import { TokenRow } from "@/pages/main/home/token-row";
import { useTokenStore } from "@/stores/token";

export default function HomePage() {
  const tokens = useTokenStore((s) => s.getTokens("nervosnetwork", true));

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-semibold">$0.00</p>
        <div className="flex space-x-1 text-green-400">
          <p className="text-sm font-semibold">+$0.00</p>
          <p className="text-sm font-semibold">+0.00%</p>
        </div>
      </div>
      <TokenDialog />
      <div className="flex flex-col space-y-2">
        {tokens.map((el) => (
          <TokenRow key={el.id} token={el} />
        ))}
      </div>
    </div>
  );
}
