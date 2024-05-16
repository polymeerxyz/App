import { parseUnit } from "@ckb-lumos/bi";
import { AddressType } from "@ckb-lumos/hd";
import test from "ava";

import { publicKeyToAddress } from "../src/ckb/address";
import DaoService from "../src/ckb/services/dao-service";
import { FeeRate } from "../src/ckb/types/fee";
import { getCommon } from "./common";

test.skip("deposit Dao", async (t) => {
  const common = getCommon(true);
  const daoService = new DaoService(common.config, common.indexer, common.rpc);

  const address = publicKeyToAddress(
    common.extendedPrivateKey!.toAccountExtendedPublicKey(),
    AddressType.Receiving,
    0,
    common.config,
  );

  const txSkeleton = await daoService.deposit({
    from: address,
    amount: parseUnit("1000", "ckb"),
    feeRate: FeeRate.NORMAL,
  });

  const tx = await daoService.signWithPrivateKeys(txSkeleton, [
    common.extendedPrivateKey!.privateKeyInfo(AddressType.Receiving, 0)
      .privateKey,
  ]);

  const hash = await daoService.send(tx);
  t.pass();
});
