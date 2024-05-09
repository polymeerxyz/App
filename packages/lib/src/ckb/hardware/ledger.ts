import { AccountExtendedPublicKey, AddressType } from "@ckb-lumos/hd";
import {
  createTransactionFromSkeleton,
  TransactionSkeletonType,
} from "@ckb-lumos/helpers";
import { CKBRPC } from "@ckb-lumos/rpc";
import { type RPC } from "@ckb-lumos/rpc/lib/types/rpc";
// import type {
//   DescriptorEvent,
//   Observer,
//   Subscription,
// } from "@ledgerhq/hw-transport";
import Transport from "@ledgerhq/hw-transport";
import { LedgerCKB } from "@polymeerxyz/hardware";
// import {
//   filter,
//   firstValueFrom,
//   Observable,
//   scan,
//   takeUntil,
//   timer,
// } from "rxjs";

export default class LedgerDevice {
  #defaultPath = AccountExtendedPublicKey.ckbAccountPath;

  #ledgerCKB: LedgerCKB = null;
  #transport: Transport = null;

  #mainnet: boolean;
  #rpc: CKBRPC;

  #connected = false;

  constructor(mainnet: boolean, rpcUrl: string) {
    this.#mainnet = mainnet;
    this.#rpc = new CKBRPC(rpcUrl);
  }

  get connected() {
    return this.#connected;
  }

  public async connect(transport: Transport) {
    if (this.#connected) return;

    this.#transport = transport;
    this.#connected = true;
    this.#ledgerCKB = new LedgerCKB(this.#transport);
  }

  public async disconnect() {
    if (!this.#connected) return;

    this.#transport?.close();
    this.#connected = false;
  }

  public async signTransaction(
    txSkeleton: TransactionSkeletonType,
    path: string,
    context?: RPC.RawTransaction[],
  ) {
    const tx = createTransactionFromSkeleton(txSkeleton);
    const rawTx = this.#rpc.paramsFormatter.toRawTransaction(tx);

    if (!context) {
      const txs = await Promise.all(
        rawTx.inputs.map((i) =>
          this.#rpc.getTransaction(i.previous_output!.tx_hash),
        ),
      );
      context = txs.map((i) =>
        this.#rpc.paramsFormatter.toRawTransaction(i.transaction),
      );
    }

    /**
     * Use derived path since public key is a derived one
     * path === AccountExtendedPublicKey.pathForReceiving(0) ? this.defaultPath : path
     */
    const signature = await this.#ledgerCKB!.signTransaction(
      path,
      rawTx,
      tx.witnesses,
      context,
      path,
    );

    return signature;
  }

  async signMessage(path: string, messageHex: string) {
    const message = this.removePrefix(messageHex);

    /**
     * Use derived path since public key is a derived one
     * path === AccountExtendedPublicKey.pathForReceiving(0) ? this.defaultPath : path
     */
    const signed = await this.#ledgerCKB!.signMessage(path, message, false);
    return this.addPrefix(signed);
  }

  async getAppVersion(): Promise<string> {
    const conf = await this.#ledgerCKB?.getAppConfiguration();
    return conf!.version;
  }

  public async getExtendedPublicKey(): Promise<{
    publicKey: string;
    chainCode: string;
  }> {
    return await this.#ledgerCKB!.getWalletExtendedPublicKey(this.#defaultPath);
  }

  async getPublicKey() {
    return this.#ledgerCKB!.getWalletPublicKey(
      this.#defaultPath,
      !this.#mainnet,
    );
  }

  async getAccountExtendedPublicKey() {
    const { publicKey: longPublicKey, chainCode } =
      await this.getExtendedPublicKey();
    const { publicKey, address } = await this.getPublicKey();

    return new AccountExtendedPublicKey(publicKey, chainCode).serialize();
  }

  // public static async findDevices() {
  //   const devices = await Promise.all([
  //     LedgerDevice.searchDevices(TransportWebHID.listen, false),
  //   ]);
  //   return devices.flat();
  // }

  // private static async searchDevices(
  //   listener: (observer: Observer<DescriptorEvent<any>>) => Subscription,
  //   isBluetooth: boolean,
  // ) {
  //   return firstValueFrom(
  //     new Observable(listener).pipe(
  //       // searching for 2 seconds
  //       takeUntil(timer(2000)),
  //       filter<DescriptorEvent<any>>((e) => e.type === "add"),
  //       scan<DescriptorEvent<any>, DeviceInfo[]>((acc, e) => {
  //         return [
  //           ...acc,
  //           {
  //             isBluetooth,
  //             descriptor: e.descriptor,
  //             vendorId: e.device.vendorId,
  //             manufacturer: e.device.manufacturer,
  //             product: e.device.product,
  //             addressIndex: 0,
  //             addressType: AddressType.Receiving,
  //           },
  //         ];
  //       }, []),
  //     ),
  //   ).catch(() => [] as DeviceInfo[]);
  // }

  private removePrefix(hex: string): string {
    if (hex.startsWith("0x")) {
      return hex.slice(2);
    }
    return hex;
  }

  private addPrefix(hex: string): string {
    if (hex.startsWith("0x")) {
      return hex;
    }
    return `0x${hex}`;
  }
}

export enum Manufacturer {
  Ledger = "Ledger",
}

export interface DeviceInfo {
  descriptor: string;
  vendorId: string;
  manufacturer: Manufacturer;
  product: string;
  isBluetooth: boolean;
  // for single address
  addressType: AddressType;
  addressIndex: number;
  // The following information may or may not be available to us
  appVersion?: string;
  firmwareVersion?: string;
}
