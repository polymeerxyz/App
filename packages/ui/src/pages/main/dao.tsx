import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDaoList } from "@/hooks/useDaoList";
import { DaoRow } from "@/pages/main/dao/dao-row";

export default function DaoPage() {
  const navigate = useNavigate();
  const { fetch: fetchDaoList, result: daos } = useDaoList();

  useEffect(() => {
    fetchDaoList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {daos.map((dao, index) => (
          <DaoRow key={dao.hash} dao={dao} />
        ))}
      </div>
      <Button className="w-full" onClick={() => navigate("deposit?withBack=true")}>
        Deposit
      </Button>
    </div>
  );
}
