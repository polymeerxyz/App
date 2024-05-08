import { predefined } from "@ckb-lumos/config-manager";
import { key } from "@ckb-lumos/hd";
import { encodeToAddress } from "@ckb-lumos/helpers";
import type Transport from "@ledgerhq/hw-transport";
import BIPPath from "bip32-path";

import { SerializeAnnotatedTransaction } from "./annotated";
import {
  AnnotatedRawTransaction,
  AnnotatedTransaction,
  AppConfiguration,
  ExtendPublicKey,
  RawTransaction,
  WalletPublicKey,
} from "./model";

/**
 * An empty WitnessArgs with enough space to fit a sighash signature into.
 */
const defaultSighashWitness =
  "55000000100000005500000055000000410000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

/**
 * Construct an AnnotatedTransaction for a given collection of signing data
 *
 * Parameters are the same as for signTransaction, but no ledger interaction is attempted.
 *
 * AnnotatedTransaction is a type defined for the ledger app that collects
 * all of the information needed to securely confirm a transaction on-screen
 * and a few bits of duplicative information to allow it to be processed as a
 * stream.
 */
function buildAnnotatedTransaction(
  signPath: string,
  rawTx: RawTransaction,
  groupWitnesses: string[],
  rawContextsTx: RawTransaction[],
  changePath: string,
): AnnotatedTransaction {
  const signBipPath = BIPPath.fromString(signPath).toPathArray();
  const changeBipPath = BIPPath.fromString(changePath).toPathArray();

  const cellInputVec = rawTx.inputs.map((input, idx) => ({
    input,
    source: rawContextsTx[idx],
  }));

  const rawTransaction: AnnotatedRawTransaction = {
    version: rawTx.version,
    cell_deps: rawTx.cell_deps,
    header_deps: rawTx.header_deps,
    inputs: cellInputVec,
    outputs: rawTx.outputs,
    outputs_data: rawTx.outputs_data,
  };

  const annotatedTransaction: AnnotatedTransaction = {
    sign_path: signBipPath,
    change_path: changeBipPath,
    input_count: rawTx.inputs.length,
    raw: rawTransaction,
    witnesses:
      Array.isArray(groupWitnesses) && groupWitnesses.length > 0
        ? groupWitnesses
        : [defaultSighashWitness],
  };

  return annotatedTransaction;
}

/**
 * Nervos API
 *
 * @example
 * import { LedgerCKB } from "@polymeerxyz/hardware";
 * const ledgerCKB = new LedgerCKB(transport);
 */
export default class LedgerCKB {
  private transport: Transport;

  constructor(transport: Transport, scrambleKey: string = "CKB") {
    this.transport = transport;
    transport.decorateAppAPIMethods(
      this,
      [
        "getAppConfiguration",
        "getWalletId",
        "getWalletPublicKey",
        "getWalletExtendedPublicKey",
        "signAnnotatedTransaction",
      ],
      scrambleKey,
    );
  }

  /**
   * Get CKB address for a given BIP 32 path.
   *
   * @param path a path in BIP 32 format
   * @return an object with a publicKey, lockArg, and (secp256k1+blake160) address.
   * @example
   * const result = await ckb.getWalletPublicKey("44'/144'/0'/0/0");
   * const publicKey = result.publicKey;
   * const lockArg = result.lockArg;
   * const address = result.address;
   */
  async getWalletPublicKey(
    path: string,
    testnet: boolean = false,
  ): Promise<WalletPublicKey> {
    const bipPath = BIPPath.fromString(path).toPathArray();

    const data = Buffer.alloc(1 + bipPath.length * 4);

    data.writeUInt8(bipPath.length, 0);
    bipPath.forEach((segment, index) => {
      data.writeUInt32BE(segment, 1 + index * 4);
    });

    const response = await this.transport.send(0x80, 0x02, 0x00, 0x00, data);

    const publicKeyLength = response[0];
    const publicKey = response.subarray(1, 1 + publicKeyLength);

    const compressedPublicKey = Buffer.alloc(33);
    compressedPublicKey.fill(publicKey[64] & 1 ? "03" : "02", 0, 1, "hex");
    compressedPublicKey.fill(publicKey.subarray(1, 33), 1, 33);

    const publicKeyHex = "0x" + compressedPublicKey.toString("hex");

    const args = key.publicKeyToBlake160(publicKeyHex);
    const template = testnet ? predefined.AGGRON4 : predefined.LINA;
    const address = encodeToAddress(
      {
        codeHash: template.SCRIPTS.SECP256K1_BLAKE160!.CODE_HASH,
        hashType: template.SCRIPTS.SECP256K1_BLAKE160!.HASH_TYPE,
        args: args,
      },
      { config: template },
    );

    return {
      publicKey: publicKeyHex,
      lockArg: args,
      address: address,
    };
  }

  /**
   * Get extended public key for a given BIP 32 path.
   *
   * @param path a path in BIP 32 format
   * @return an object with a publicKey
   * @example
   * const result = await ckb.getWalletExtendedPublicKey("44'/144'/0'/0/0");
   * const publicKey = result;
   */
  async getWalletExtendedPublicKey(path: string): Promise<ExtendPublicKey> {
    const bipPath = BIPPath.fromString(path).toPathArray();

    const data = Buffer.alloc(1 + bipPath.length * 4);

    data.writeUInt8(bipPath.length, 0);
    bipPath.forEach((segment, index) => {
      data.writeUInt32BE(segment, 1 + index * 4);
    });

    const response = await this.transport.send(0x80, 0x04, 0x00, 0x00, data);
    const publicKeyLength = response[0];
    const chainCodeOffset = 2 + publicKeyLength;
    const chainCodeLength = response[1 + publicKeyLength];

    return {
      publicKey:
        "0x" + response.subarray(1, 1 + publicKeyLength).toString("hex"),
      chainCode:
        "0x" +
        response
          .subarray(chainCodeOffset, chainCodeOffset + chainCodeLength)
          .toString("hex"),
    };
  }

  /**
   * Sign a Nervos transaction with a given BIP 32 path
   *
   * @param signPath the path to sign with, in BIP 32 format
   * @param rawTxHex a transaction to sign
   * @param groupWitnessesHex hex of in-group and extra witnesses to include in signature
   * @param contextTransaction list of transaction contexts for parsing
   * @param changePath the path the transaction sends change to, in BIP 32 format (optional, defaults to signPath)
   * @return a signature as hex string
   * @example
   * TODO
   */
  async signTransaction(
    signPath: string,
    rawTx: RawTransaction,
    groupWitnessesHex: string[],
    rawContextsTx: RawTransaction[],
    changePath: string,
  ): Promise<string> {
    return await this.signAnnotatedTransaction(
      buildAnnotatedTransaction(
        signPath,
        rawTx,
        groupWitnessesHex,
        rawContextsTx,
        changePath,
      ),
    );
  }

  /**
   * Sign an already constructed AnnotatedTransaction.
   */
  private async signAnnotatedTransaction(
    tx: AnnotatedTransaction,
  ): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawAnTx = Buffer.from(SerializeAnnotatedTransaction(tx as any));

    const maxApduSize = 230;

    const txFullChunks = Math.floor(rawAnTx.byteLength / maxApduSize);
    let isContinuation = 0x00;
    for (let i = 0; i < txFullChunks; i++) {
      const data = rawAnTx.slice(i * maxApduSize, (i + 1) * maxApduSize);
      await this.transport.send(0x80, 0x03, isContinuation, 0x00, data);
      isContinuation = 0x01;
    }

    const lastOffset = txFullChunks * maxApduSize;
    const lastData = rawAnTx.slice(lastOffset, lastOffset + maxApduSize);
    const response = await this.transport.send(
      0x80,
      0x03,
      isContinuation | 0x80,
      0x00,
      lastData,
    );
    return response.slice(0, 65).toString("hex");
  }

  /**
   * Get the version of the Nervos app installed on the hardware device
   *
   * @return an object with a version
   * @example
   * const result = await ckb.getAppConfiguration();
   *
   * {
   *   "version": "1.0.3",
   *   "hash": "0000000000000000000000000000000000000000"
   * }
   */
  async getAppConfiguration(): Promise<AppConfiguration> {
    const response1 = await this.transport.send(0x80, 0x00, 0x00, 0x00);
    const response2 = await this.transport.send(0x80, 0x09, 0x00, 0x00);
    return {
      version: "" + response1[0] + "." + response1[1] + "." + response1[2],
      hash: response2.subarray(0, -3).toString("hex"), // last 3 bytes should be 0x009000
    };
  }

  /**
   * Get the wallet identifier for the Ledger wallet
   *
   * @return a byte string
   * @example
   * const id = await ckb.getWalletId();
   *
   * "0x69c46b6dd072a2693378ef4f5f35dcd82f826dc1fdcc891255db5870f54b06e6"
   */
  async getWalletId(): Promise<string> {
    const response = await this.transport.send(0x80, 0x01, 0x00, 0x00);

    const result = response.subarray(0, 32).toString("hex");
    return result;
  }

  /**
   * Sign a Nervos message with a given BIP 32 path
   *
   * @param path a path in BIP 32 format
   * @param rawMsgHex a message to sign
   * @param displayHex display hex
   * @return a signature as hex string
   */
  async signMessage(
    path: string,
    rawMsgHex: string,
    displayHex: boolean,
  ): Promise<string> {
    const bipPath = BIPPath.fromString(path).toPathArray();
    const magicBytes = Buffer.from("Nervos Message:");
    const rawMsg = Buffer.concat([magicBytes, Buffer.from(rawMsgHex, "hex")]);

    //Init apdu
    const rawPath = Buffer.alloc(1 + 1 + bipPath.length * 4);
    rawPath.writeInt8(displayHex ? 1 : 0, 0);
    rawPath.writeInt8(bipPath.length, 1);
    bipPath.forEach((segment, index) => {
      rawPath.writeUInt32BE(segment, 2 + index * 4);
    });
    await this.transport.send(0x80, 0x06, 0x00, 0x00, rawPath);

    // Msg Chunking
    const maxApduSize = 230;
    const txFullChunks = Math.floor(rawMsg.length / maxApduSize);
    for (let i = 0; i < txFullChunks; i++) {
      const data = rawMsg.subarray(i * maxApduSize, (i + 1) * maxApduSize);
      await this.transport.send(0x80, 0x06, 0x01, 0x00, data);
    }

    const lastOffset = Math.floor(rawMsg.length / maxApduSize) * maxApduSize;
    const lastData = rawMsg.subarray(lastOffset, lastOffset + maxApduSize);
    const response = await this.transport.send(
      0x80,
      0x06,
      0x81,
      0x00,
      lastData,
    );
    return response.subarray(0, 65).toString("hex");
  }
}
