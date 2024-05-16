import test from "ava";

import XUDTService from "../src/ckb/services/xudt-service";
import { getCommon } from "./common";

test("get xudt info", async (t) => {
  const common = getCommon(false);

  const xudtArgs =
    "0x122ae563f351bcaffef58bb57d5f4f863034721b361c645099501039a51d5936";
  const xudtService = new XUDTService(
    common.config,
    common.indexer,
    common.rpc,
  );

  const xudtInfo = await xudtService.getXUDTInfo(xudtArgs);

  t.is(
    xudtInfo.id,
    "0x757b1cf54ebc57f2b94fb2bc273166ba6f68b68001acad5cc557cb4935d1213b",
  );
  t.is(xudtInfo.decimal, 12);
  t.is(xudtInfo.name, "Seal");
  t.is(xudtInfo.symbol, "SEAL");
});
