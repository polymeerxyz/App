import {
  openTransportReplayer,
  RecordStore,
} from "@ledgerhq/hw-transport-mocker";
import test from "ava";

import LedgerCKB from "../src/ledger";
import {
  change_path,
  contexts,
  sign_path,
  transaction,
  witnesses,
} from "./fixtures";

test("ckb.getPublicKey", async (t) => {
  const transport = await openTransportReplayer(
    RecordStore.fromString(
      `
      => 8002000015058000002c80000135800000000000000100000000
      <= 4104d066dbe5603004dc4c83e27106b098f5e9b9b17b6bdec965810cd0921193b1c87206518153a0b44c7ae6b0be92a60d515d454e71ab27943bbb323273b8bdd46a9000
      `,
    ),
  );
  const ckb = new LedgerCKB(transport);

  const result = await ckb.getWalletPublicKey("m/44'/309'/0'/1/0");
  t.deepEqual(result, {
    publicKey:
      "0x02d066dbe5603004dc4c83e27106b098f5e9b9b17b6bdec965810cd0921193b1c8",
    lockArg: "0xa3912c9414bfd45b830478c05385dfa4d560c859",
    address:
      "ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqdrjykfg99l63dcxprccpfcthay64svskg7y2cn8",
  });
});

test("ckb.getAppConfiguration", async (t) => {
  const transport = await openTransportReplayer(
    RecordStore.fromString(
      `
      => 8000000000
      <= 0001009000
      => 8009000000
      <= 0001009000
      `,
    ),
  );
  const ckb = new LedgerCKB(transport);

  const configuration = await ckb.getAppConfiguration();
  t.deepEqual(configuration, {
    version: "0.1.0",
    hash: "0001",
  });
});

test("ckb.getWalletId", async (t) => {
  const transport = await openTransportReplayer(
    RecordStore.fromString(
      `
      => 8001000000
      <= 27fe5acb022cd7b8be0eb7009d42ff4600c597d28b6affefcab6f7396d1311c2f58fc334be619099b733be1da93f26b674bd08d110b39f6d39b6cf6aa01618a59000
      `,
    ),
  );
  const ckb = new LedgerCKB(transport);

  const result = await ckb.getWalletId();
  t.deepEqual(
    result,
    "27fe5acb022cd7b8be0eb7009d42ff4600c597d28b6affefcab6f7396d1311c2",
  );
});

test("ckb.signTransaction", async (t) => {
  const transport = await openTransportReplayer(
    RecordStore.fromString(
      `
      => 80030000e6e1050000180000002c000000400000004400000078050000040000002c000080350100800100000000000000040000002c00008035010080010000000000000002000000340500001c000000200000006e0000007200000052040000200500000000000002000000a563884b3686078ec7e7677a5f86449b15cf2693f3c1241766c6996f206cc5410200000000ace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708000000000100000000e00300000c00000051020000450200000c000000380000000000000000000000b1b547956a0dfb7ea618231563b3acd2
      <= 00009000
      => 80030100e63607586e939f88e5a6db5f392b2e78d5010000000d0200001c000000200000006e00000092000000ee000000f10100000000000002000000a563884b3686078ec7e7677a5f86449b15cf2693f3c1241766c6996f206cc5410200000000ace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708000000000101000000327f1fc62c53530c6c27018f1e8cee27c35c0370c3b4d3376daf8fe110e7d8cb020000000000000000000000c399495011b912999dbc72cf54982924e328ae170654ef76c8aba190ca376307000000000000000000000000c317d0b0b2a513ab
      <= 00009000
      => 80030100e61206e6d454c1960de7d7b4b80d0748a3e1f9cb197b74b8a501000000030100000c000000a200000096000000100000001800000061000000000000174876e800490000001000000030000000310000009bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce80114000000e5260d839a786ac2a909181df9a423f1efbe863d3500000010000000300000003100000082d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e0100000000610000001000000018000000610000000000001773b2e56449000000100000003000000031000000
      <= 00009000
      => 80030100e69bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce80114000000e5260d839a786ac2a909181df9a423f1efbe863d1c0000000c00000018000000080000005207000000000000000000008f0100000c000000380000000000000000000000258e82bab2af21fd8899fc872742f4acea831f5e4c232297816b9bf4a19597a900000000570100001c000000200000006e000000b2000000e20000004b0100000000000002000000a563884b3686078ec7e7677a5f86449b15cf2693f3c1241766c6996f206cc5410200000000ace5ea83c478bb866edf122ff8620857
      <= 00009000
      => 80030100e689158f5cbff155b7bb5f13058555b708000000000102000000327f1fc62c53530c6c27018f1e8cee27c35c0370c3b4d3376daf8fe110e7d8cb4930ba433e606a53f4f283f02dddeb6d51b0dc3e463629b14a27995de9c71eca0100000020000100000008bab1b547956a0dfb7ea618231563b3acd23607586e939f88e5a6db5f392b2e78d50000000069000000080000006100000010000000180000006100000000000017634361c5490000001000000030000000310000009bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce80114000000e5260d839a786ac2
      <= 00009000
      => 80030100e6a909181df9a423f1efbe863d0c0000000800000000000000ce0000000c0000006d00000061000000100000001800000061000000000000174876e800490000001000000030000000310000009bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce80114000000e5260d839a786ac2a909181df9a423f1efbe863d61000000100000001800000061000000000000178e701ce9490000001000000030000000310000009bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce80114000000e5260d839a786ac2a909181df9a423f1efbe863d
      <= 00009000
      => 800381007d140000000c000000100000000000000000000000690000000c00000065000000550000005500000010000000550000005500000041000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
      <= ffa4127d531b7d22bc5f6cfd0cdf23431eb510ab36def53898d156abe7d869b764274c4417ff2342a80c78e8e645a59b20ccac702202d5f2cd2b822a02241272009000
      `,
    ),
  );
  const ckb = new LedgerCKB(transport);

  const result = await ckb.signTransaction(
    sign_path,
    transaction,
    witnesses,
    contexts,
    change_path,
  );
  t.deepEqual(
    result,
    "ffa4127d531b7d22bc5f6cfd0cdf23431eb510ab36def53898d156abe7d869b764274c4417ff2342a80c78e8e645a59b20ccac702202d5f2cd2b822a0224127200",
  );
});

test("ckb.signMessage", async (t) => {
  const transport = await openTransportReplayer(
    RecordStore.fromString(
      `
      => 800600001600058000002c80000135800000000000000100000000
      <= 00009000
      => 800681001a4e6572766f73204d6573736167653a48656c6c6f20776f726c64
      <= be13155a7f6815c715f7dcdc797038e1d5e03621a716ce9aafa2265408ab36833b262855b79e28c99a43ed8dc046577e3cd7445e0f5a8c2a8ebcb7092c53141d029000
      `,
    ),
  );
  const ckb = new LedgerCKB(transport);

  const result = await ckb.signMessage(
    "m/44'/309'/0'/1/0",
    "48656c6c6f20776f726c64",
    false,
  );
  t.deepEqual(
    result,
    "be13155a7f6815c715f7dcdc797038e1d5e03621a716ce9aafa2265408ab36833b262855b79e28c99a43ed8dc046577e3cd7445e0f5a8c2a8ebcb7092c53141d02",
  );
});