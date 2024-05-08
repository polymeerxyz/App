import { parseUnit } from "@ckb-lumos/bi";
import { AddressType } from "@ckb-lumos/hd";
import test from "ava";

import { publicKeyToAddress } from "../src/ckb/address";
import DaoService from "../src/ckb/services/dao-service";
import { FeeRate } from "../src/ckb/types/fee";
import { ckb } from "./common";

test("ckb/services/dao-service.deposit", async (t) => {
  const daoService = new DaoService(ckb.config, ckb.indexer, ckb.rpc);

  const address = publicKeyToAddress(
    ckb.extendedPrivateKey.toAccountExtendedPublicKey(),
    AddressType.Receiving,
    0,
    ckb.config,
  );

  const txSkeleton = await daoService.deposit({
    from: address,
    amount: parseUnit("1000", "ckb"),
    feeRate: FeeRate.NORMAL,
  });

  const tx = await daoService.signWithPrivateKeys(txSkeleton, [
    ckb.extendedPrivateKey.privateKeyInfo(AddressType.Receiving, 0).privateKey,
  ]);

  const hash = await daoService.send(tx);
  t.pass();
});
