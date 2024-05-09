import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import { ckb } from "@polymeerxyz/lib";

// Singleton here for the whole application
export const getLedgerDevice = (() => {
  let _device: ckb.LedgerDevice;
  let _mainnet: boolean;
  let _rpcUrl: string;

  return async (mainnet: boolean, rpcUrl: string) => {
    if (_device && _mainnet === mainnet && _rpcUrl === rpcUrl) return _device;

    const device = new ckb.LedgerDevice(mainnet, rpcUrl);

    const transport = await TransportWebHID.create();
    await device.connect(transport);

    _device = device;
    _mainnet = mainnet;
    _rpcUrl = rpcUrl;
    return _device;
  };
})();
