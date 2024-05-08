function dataLengthError(actual: number, required: number | string) {
  throw new Error(
    `Invalid data length! Required: ${required}, actual: ${actual}`,
  );
}

function assertDataLength(actual: number, required: number) {
  if (actual !== required) {
    dataLengthError(actual, required);
  }
}

type CastToArrayBuffer = {
  toArrayBuffer(): ArrayBuffer;
};

type Reader = string | bigint | ArrayBuffer | CastToArrayBuffer;

function assertArrayBuffer(reader: Reader, padTo?: number) {
  let result: ArrayBuffer;

  if (typeof reader === "string") {
    let hex = reader.replace(/^0x/, "");
    let tmp: Buffer;
    if (padTo != undefined) {
      // padTo is defined for numbers, which are stored bigendian and non-multiple-of-2.
      hex = hex.padStart(padTo * 2, "0");
      tmp = Buffer.from(hex.match(/../g).reverse().join(""), "hex");
    } else {
      tmp = Buffer.from(hex, "hex");
    }
    result = tmp.buffer.slice(tmp.byteOffset, tmp.byteOffset + tmp.byteLength);
  }

  if (typeof reader === "bigint") {
    result = new ArrayBuffer(padTo);
    const tmpDV = new DataView(result);
    tmpDV.setBigUint64(0, reader.valueOf(), true);
  }

  if (reader instanceof Object && reader["toArrayBuffer"] instanceof Function) {
    result = (reader as CastToArrayBuffer).toArrayBuffer();
  }

  if (!(result instanceof ArrayBuffer)) {
    throw new Error(
      "Provided value must be an ArrayBuffer or can be transformed into ArrayBuffer!",
    );
  }

  return result;
}

function verifyAndExtractOffsets(
  view: DataView,
  expectedFieldCount: number,
  compatible: boolean,
) {
  if (view.byteLength < 4) {
    dataLengthError(view.byteLength, ">4");
  }

  const requiredByteLength = view.getUint32(0, true);
  assertDataLength(view.byteLength, requiredByteLength);
  if (requiredByteLength === 4) {
    return [requiredByteLength];
  }

  if (requiredByteLength < 8) {
    dataLengthError(view.byteLength, ">8");
  }

  const firstOffset = view.getUint32(4, true);
  if (firstOffset % 4 !== 0 || firstOffset < 8) {
    throw new Error(`Invalid first offset: ${firstOffset}`);
  }

  const itemCount = firstOffset / 4 - 1;
  if (itemCount < expectedFieldCount) {
    throw new Error(
      `Item count not enough! Required: ${expectedFieldCount}, actual: ${itemCount}`,
    );
  } else if (!compatible && itemCount > expectedFieldCount) {
    throw new Error(
      `Item count is more than required! Required: ${expectedFieldCount}, actual: ${itemCount}`,
    );
  }

  if (requiredByteLength < firstOffset) {
    throw new Error(`First offset is larger than byte length: ${firstOffset}`);
  }

  const offsets = [];
  for (let i = 0; i < itemCount; i++) {
    const start = 4 + i * 4;
    offsets.push(view.getUint32(start, true));
  }

  offsets.push(requiredByteLength);
  for (let i = 0; i < offsets.length - 1; i++) {
    if (offsets[i] > offsets[i + 1]) {
      throw new Error(
        `Offset index ${i}: ${offsets[i]} is larger than offset index ${
          i + 1
        }: ${offsets[i + 1]}`,
      );
    }
  }
  return offsets;
}

function fromStringEnum(val: string | number) {
  switch (typeof val) {
    case "string":
      switch (val.toLowerCase()) {
        case "code":
        case "data":
          return 0;
        case "dep_group":
        case "type":
          return 1;
        default:
          throw new Error("Not a valid byte representation: " + val);
      }
    case "number":
      return val;
    default:
      throw new Error("Not a valid byte representation: " + val);
  }
}

function serializeTable(buffers: ArrayBuffer[]) {
  const itemCount = buffers.length;
  let totalSize = 4 * (itemCount + 1);
  const offsets = [];

  for (let i = 0; i < itemCount; i++) {
    offsets.push(totalSize);
    totalSize += buffers[i].byteLength;
  }

  const buffer = new ArrayBuffer(totalSize);
  const array = new Uint8Array(buffer);
  const view = new DataView(buffer);

  view.setUint32(0, totalSize, true);
  for (let i = 0; i < itemCount; i++) {
    view.setUint32(4 + i * 4, offsets[i], true);
    array.set(new Uint8Array(buffers[i]), offsets[i]);
  }
  return buffer;
}

export class AnnotatedCellInput {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    const offsets = verifyAndExtractOffsets(this.view, 0, true);
    new CellInput(this.view.buffer.slice(offsets[0], offsets[1]), {
      validate: false,
    }).validate();
    new RawTransaction(this.view.buffer.slice(offsets[1], offsets[2]), {
      validate: false,
    }).validate();
  }

  getInput() {
    const start = 4;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new CellInput(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getSource() {
    const start = 8;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.byteLength;
    return new RawTransaction(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  toObject() {
    return {
      input: this.getInput().toObject(),
      source: this.getSource().toObject(),
    };
  }
}

export function SerializeAnnotatedCellInput(
  value: AnnotatedCellInput | ReturnType<AnnotatedCellInput["toObject"]>,
) {
  if (value instanceof AnnotatedCellInput) return value.view.buffer;
  const buffers = [];
  buffers.push(SerializeCellInput(value.input));
  buffers.push(SerializeRawTransaction(value.source));
  return serializeTable(buffers);
}

export class AnnotatedCellInputVec {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    const offsets = verifyAndExtractOffsets(this.view, 0, true);
    for (let i = 0; i < offsets.length - 1; i++) {
      new AnnotatedCellInput(
        this.view.buffer.slice(offsets[i], offsets[i + 1]),
        { validate: false },
      ).validate();
    }
  }

  length() {
    if (this.view.byteLength < 8) {
      return 0;
    } else {
      return this.view.getUint32(4, true) / 4 - 1;
    }
  }

  indexAt(i: number) {
    const start = 4 + i * 4;
    const offset = this.view.getUint32(start, true);
    let offset_end = this.view.byteLength;
    if (i + 1 < this.length()) {
      offset_end = this.view.getUint32(start + 4, true);
    }
    return new AnnotatedCellInput(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  toObject() {
    const len = this.length();
    const rv: ReturnType<AnnotatedCellInput["toObject"]>[] = [];
    for (let i = 0; i < len; i++) {
      rv.push(this.indexAt(i).toObject());
    }
    return rv;
  }
}

export function SerializeAnnotatedCellInputVec(
  value: AnnotatedCellInputVec | ReturnType<AnnotatedCellInputVec["toObject"]>,
) {
  if (value instanceof AnnotatedCellInputVec) return value.view.buffer;
  return serializeTable(value.map((item) => SerializeAnnotatedCellInput(item)));
}

export class AnnotatedRawTransaction {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    const offsets = verifyAndExtractOffsets(this.view, 0, true);
    new Uint32(this.view.buffer.slice(offsets[0], offsets[1]), {
      validate: false,
    }).validate();
    new CellDepVec(this.view.buffer.slice(offsets[1], offsets[2]), {
      validate: false,
    }).validate();
    new Byte32Vec(this.view.buffer.slice(offsets[2], offsets[3]), {
      validate: false,
    }).validate();
    new AnnotatedCellInputVec(this.view.buffer.slice(offsets[3], offsets[4]), {
      validate: false,
    }).validate();
    new CellOutputVec(this.view.buffer.slice(offsets[4], offsets[5]), {
      validate: false,
    }).validate();
    new BytesVec(this.view.buffer.slice(offsets[5], offsets[6]), {
      validate: false,
    }).validate();
  }

  getVersion() {
    const start = 4;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new Uint32(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getCellDeps() {
    const start = 8;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new CellDepVec(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getHeaderDeps() {
    const start = 12;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new Byte32Vec(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getInputs() {
    const start = 16;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new AnnotatedCellInputVec(
      this.view.buffer.slice(offset, offset_end),
      { validate: false },
    );
  }

  getOutputs() {
    const start = 20;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new CellOutputVec(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getOutputsData() {
    const start = 24;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.byteLength;
    return new BytesVec(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  toObject() {
    return {
      version: this.getVersion().toObject(),
      cell_deps: this.getCellDeps().toObject(),
      header_deps: this.getHeaderDeps().toObject(),
      inputs: this.getInputs().toObject(),
      outputs: this.getOutputs().toObject(),
      outputs_data: this.getOutputsData().toObject(),
    };
  }
}

export function SerializeAnnotatedRawTransaction(
  value:
    | AnnotatedRawTransaction
    | ReturnType<AnnotatedRawTransaction["toObject"]>,
) {
  if (value instanceof AnnotatedRawTransaction) return value.view.buffer;
  const buffers = [];
  buffers.push(SerializeUint32(value.version));
  buffers.push(SerializeCellDepVec(value.cell_deps));
  buffers.push(SerializeByte32Vec(value.header_deps));
  buffers.push(SerializeAnnotatedCellInputVec(value.inputs));
  buffers.push(SerializeCellOutputVec(value.outputs));
  buffers.push(SerializeBytesVec(value.outputs_data));
  return serializeTable(buffers);
}

export class Bip32 {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    if (this.view.byteLength < 4) {
      dataLengthError(this.view.byteLength, ">4");
    }
    const requiredByteLength = this.length() * Uint32.size() + 4;
    assertDataLength(this.view.byteLength, requiredByteLength);
    for (let i = 0; i < 0; i++) {
      const item = this.indexAt(i);
      item.validate();
    }
  }

  indexAt(i: number) {
    return new Uint32(
      this.view.buffer.slice(
        4 + i * Uint32.size(),
        4 + (i + 1) * Uint32.size(),
      ),
      { validate: false },
    );
  }

  toObject() {
    const len = this.length();
    const rv: ReturnType<Uint32["toObject"]>[] = [];
    for (let i = 0; i < len; i++) {
      rv.push(this.indexAt(i).toObject());
    }
    return rv;
  }

  length() {
    return this.view.getUint32(0, true);
  }
}

export function SerializeBip32(value: Bip32 | ReturnType<Bip32["toObject"]>) {
  if (value instanceof Bip32) return value.view.buffer;
  const array = new Uint8Array(4 + Uint32.size() * value.length);
  new DataView(array.buffer).setUint32(0, value.length, true);
  for (let i = 0; i < value.length; i++) {
    const itemBuffer = SerializeUint32(value[i]);
    array.set(new Uint8Array(itemBuffer), 4 + i * Uint32.size());
  }
  return array.buffer;
}

export class AnnotatedTransaction {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    const offsets = verifyAndExtractOffsets(this.view, 0, true);
    new Bip32(this.view.buffer.slice(offsets[0], offsets[1]), {
      validate: false,
    }).validate();
    new Bip32(this.view.buffer.slice(offsets[1], offsets[2]), {
      validate: false,
    }).validate();
    new Uint32(this.view.buffer.slice(offsets[2], offsets[3]), {
      validate: false,
    }).validate();
    new AnnotatedRawTransaction(
      this.view.buffer.slice(offsets[3], offsets[4]),
      { validate: false },
    ).validate();
    new BytesVec(this.view.buffer.slice(offsets[4], offsets[5]), {
      validate: false,
    }).validate();
  }

  getSignPath() {
    const start = 4;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new Bip32(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getChangePath() {
    const start = 8;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new Bip32(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getInputCount() {
    const start = 12;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new Uint32(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getRaw() {
    const start = 16;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new AnnotatedRawTransaction(
      this.view.buffer.slice(offset, offset_end),
      { validate: false },
    );
  }

  getWitnesses() {
    const start = 20;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.byteLength;
    return new BytesVec(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  toObject() {
    return {
      sign_path: this.getSignPath().toObject(),
      change_path: this.getChangePath().toObject(),
      input_count: this.getInputCount().toObject(),
      raw: this.getRaw().toObject(),
      witnesses: this.getWitnesses().toObject(),
    };
  }
}

export function SerializeAnnotatedTransaction(
  value: AnnotatedTransaction | ReturnType<AnnotatedTransaction["toObject"]>,
) {
  if (value instanceof AnnotatedTransaction) return value.view.buffer;
  const buffers = [];
  buffers.push(SerializeBip32(value.sign_path));
  buffers.push(SerializeBip32(value.change_path));
  buffers.push(SerializeUint32(value.input_count));
  buffers.push(SerializeAnnotatedRawTransaction(value.raw));
  buffers.push(SerializeBytesVec(value.witnesses));
  return serializeTable(buffers);
}

export class Uint32 {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    assertDataLength(this.view.byteLength, 4);
  }

  indexAt(i: number) {
    return this.view.getUint8(i);
  }

  raw() {
    return this.view.buffer;
  }

  toBigEndianUint32() {
    return this.view.getUint32(0, false);
  }

  toLittleEndianUint32() {
    return this.view.getUint32(0, true);
  }

  toObject() {
    return this.toLittleEndianUint32();
  }

  static size() {
    return 4;
  }
}

export function SerializeUint32(
  value: Uint32 | ReturnType<Uint32["toObject"]>,
) {
  if (value instanceof Uint32) return value.view.buffer;
  switch (typeof value) {
    case "number":
      const tmp = new ArrayBuffer(4);
      const tmpDV = new DataView(tmp);
      tmpDV.setInt32(0, value, true);
      return tmp;
    default: {
      const buffer = assertArrayBuffer(value, 4);
      assertDataLength(buffer.byteLength, 4);
      return buffer;
    }
  }
}

export class Uint64 {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    assertDataLength(this.view.byteLength, 8);
  }

  indexAt(i: number) {
    return this.view.getUint8(i);
  }

  raw() {
    return this.view.buffer;
  }

  toObject() {
    return Buffer.from(this.raw()).toString("hex");
  }

  static size() {
    return 8;
  }
}

export function SerializeUint64(
  value: Uint64 | ReturnType<Uint64["toObject"]>,
) {
  if (value instanceof Uint64) return value.view.buffer;
  switch (typeof value) {
    case "number":
      throw new Error("Can't accept numbers for unusual byte arrays");
    default: {
      const buffer = assertArrayBuffer(value, 8);
      assertDataLength(buffer.byteLength, 8);
      return buffer;
    }
  }
}

export class Uint128 {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    assertDataLength(this.view.byteLength, 16);
  }

  indexAt(i: number) {
    return this.view.getUint8(i);
  }

  raw() {
    return this.view.buffer;
  }

  toObject() {
    return Buffer.from(this.raw()).toString("hex");
  }

  static size() {
    return 16;
  }
}

export function SerializeUint128(
  value: Uint128 | ReturnType<Uint128["toObject"]>,
) {
  if (value instanceof Uint128) return value.view.buffer;
  switch (typeof value) {
    case "number":
      throw new Error("Can't accept numbers for unusual byte arrays");
    default: {
      const buffer = assertArrayBuffer(value);
      assertDataLength(buffer.byteLength, 16);
      return buffer;
    }
  }
}

export class Uint256 {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    assertDataLength(this.view.byteLength, 32);
  }

  indexAt(i: number) {
    return this.view.getUint8(i);
  }

  raw() {
    return this.view.buffer;
  }

  toObject() {
    return Buffer.from(this.raw()).toString("hex");
  }

  static size() {
    return 32;
  }
}

export function SerializeUint256(
  value: Uint256 | ReturnType<Uint256["toObject"]>,
) {
  if (value instanceof Uint256) return value.view.buffer;
  switch (typeof value) {
    case "number":
      throw new Error("Can't accept numbers for unusual byte arrays");
    default: {
      const buffer = assertArrayBuffer(value);
      assertDataLength(buffer.byteLength, 32);
      return buffer;
    }
  }
}

export class Byte32 {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    assertDataLength(this.view.byteLength, 32);
  }

  indexAt(i: number) {
    return this.view.getUint8(i);
  }

  raw() {
    return this.view.buffer;
  }

  toObject() {
    return Buffer.from(this.raw()).toString("hex");
  }

  static size() {
    return 32;
  }
}

export function SerializeByte32(
  value: Byte32 | ReturnType<Byte32["toObject"]>,
) {
  if (value instanceof Byte32) return value.view.buffer;
  switch (typeof value) {
    case "number":
      throw new Error("Can't accept numbers for unusual byte arrays");
    default: {
      const buffer = assertArrayBuffer(value);
      assertDataLength(buffer.byteLength, 32);
      return buffer;
    }
  }
}

export class Bytes {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    if (this.view.byteLength < 4) {
      dataLengthError(this.view.byteLength, ">4");
    }
    const requiredByteLength = this.length() + 4;
    assertDataLength(this.view.byteLength, requiredByteLength);
  }

  raw() {
    return this.view.buffer.slice(4);
  }

  indexAt(i: number) {
    return this.view.getUint8(4 + i);
  }

  toObject() {
    return Buffer.from(this.raw()).toString("hex");
  }

  length() {
    return this.view.getUint32(0, true);
  }
}

export function SerializeBytes(value: Bytes | ReturnType<Bytes["toObject"]>) {
  if (value instanceof Bytes) return value.view.buffer;
  const item = assertArrayBuffer(value);
  const array = new Uint8Array(4 + item.byteLength);
  new DataView(array.buffer).setUint32(0, item.byteLength, true);
  array.set(new Uint8Array(item), 4);
  return array.buffer;
}

export class BytesOpt {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    if (this.hasValue()) {
      this.value().validate();
    }
  }

  value() {
    return new Bytes(this.view.buffer, { validate: false });
  }

  toObject() {
    if (this.hasValue()) return this.value().toObject();
    return null;
  }

  hasValue() {
    return this.view.byteLength > 0;
  }
}

export function SerializeBytesOpt(
  value: BytesOpt | ReturnType<BytesOpt["toObject"]>,
) {
  if (value instanceof BytesOpt) return value.view.buffer;
  if (value) {
    return SerializeBytes(value);
  } else {
    return new ArrayBuffer(0);
  }
}

export class BytesVec {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    const offsets = verifyAndExtractOffsets(this.view, 0, true);
    for (let i = 0; i < offsets.length - 1; i++) {
      new Bytes(this.view.buffer.slice(offsets[i], offsets[i + 1]), {
        validate: false,
      }).validate();
    }
  }

  length() {
    if (this.view.byteLength < 8) {
      return 0;
    } else {
      return this.view.getUint32(4, true) / 4 - 1;
    }
  }

  indexAt(i: number) {
    const start = 4 + i * 4;
    const offset = this.view.getUint32(start, true);
    let offset_end = this.view.byteLength;
    if (i + 1 < this.length()) {
      offset_end = this.view.getUint32(start + 4, true);
    }
    return new Bytes(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  toObject() {
    const len = this.length();
    const rv: ReturnType<Bytes["toObject"]>[] = [];
    for (let i = 0; i < len; i++) {
      rv.push(this.indexAt(i).toObject());
    }
    return rv;
  }
}

export function SerializeBytesVec(
  value: BytesVec | ReturnType<BytesVec["toObject"]>,
) {
  if (value instanceof BytesVec) return value.view.buffer;
  return serializeTable(value.map((item) => SerializeBytes(item)));
}

export class Byte32Vec {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    if (this.view.byteLength < 4) {
      dataLengthError(this.view.byteLength, ">4");
    }
    const requiredByteLength = this.length() * Byte32.size() + 4;
    assertDataLength(this.view.byteLength, requiredByteLength);
    for (let i = 0; i < 0; i++) {
      const item = this.indexAt(i);
      item.validate();
    }
  }

  indexAt(i: number) {
    return new Byte32(
      this.view.buffer.slice(
        4 + i * Byte32.size(),
        4 + (i + 1) * Byte32.size(),
      ),
      { validate: false },
    );
  }

  toObject() {
    const len = this.length();
    const rv: ReturnType<Byte32["toObject"]>[] = [];
    for (let i = 0; i < len; i++) {
      rv.push(this.indexAt(i).toObject());
    }
    return rv;
  }

  length() {
    return this.view.getUint32(0, true);
  }
}

export function SerializeByte32Vec(
  value: Byte32Vec | ReturnType<Byte32Vec["toObject"]>,
) {
  if (value instanceof Byte32Vec) return value.view.buffer;
  const array = new Uint8Array(4 + Byte32.size() * value.length);
  new DataView(array.buffer).setUint32(0, value.length, true);
  for (let i = 0; i < value.length; i++) {
    const itemBuffer = SerializeByte32(value[i]);
    array.set(new Uint8Array(itemBuffer), 4 + i * Byte32.size());
  }
  return array.buffer;
}

export class Script {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    const offsets = verifyAndExtractOffsets(this.view, 0, true);
    new Byte32(this.view.buffer.slice(offsets[0], offsets[1]), {
      validate: false,
    }).validate();
    if (offsets[2] - offsets[1] !== 1) {
      throw new Error(
        `Invalid offset for hash_type: ${offsets[1]} - ${offsets[2]}`,
      );
    }
    new Bytes(this.view.buffer.slice(offsets[2], offsets[3]), {
      validate: false,
    }).validate();
  }

  getCodeHash() {
    const start = 4;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new Byte32(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getHashType() {
    const start = 8;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new DataView(this.view.buffer.slice(offset, offset_end)).getUint8(0);
  }

  getArgs() {
    const start = 12;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.byteLength;
    return new Bytes(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  toObject() {
    return {
      code_hash: this.getCodeHash().toObject(),
      hash_type: this.getHashType(),
      args: this.getArgs().toObject(),
    };
  }
}

export function SerializeScript(
  value: Script | ReturnType<Script["toObject"]>,
) {
  if (value instanceof Script) return value.view.buffer;
  const buffers = [];
  buffers.push(SerializeByte32(value.code_hash));
  const hashTypeView = new DataView(new ArrayBuffer(1));
  hashTypeView.setUint8(0, fromStringEnum(value.hash_type));
  buffers.push(hashTypeView.buffer);
  buffers.push(SerializeBytes(value.args));
  return serializeTable(buffers);
}

export class ScriptOpt {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    if (this.hasValue()) {
      this.value().validate();
    }
  }

  value() {
    return new Script(this.view.buffer, { validate: false });
  }

  toObject() {
    if (this.hasValue()) return this.value().toObject();
    return null;
  }

  hasValue() {
    return this.view.byteLength > 0;
  }
}

export function SerializeScriptOpt(
  value: ScriptOpt | ReturnType<ScriptOpt["toObject"]>,
) {
  if (value instanceof ScriptOpt) return value.view.buffer;
  if (value) {
    return SerializeScript(value);
  } else {
    return new ArrayBuffer(0);
  }
}

export class OutPoint {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  getTxHash() {
    return new Byte32(this.view.buffer.slice(0, 0 + Byte32.size()), {
      validate: false,
    });
  }

  getIndex() {
    return new Uint32(
      this.view.buffer.slice(
        0 + Byte32.size(),
        0 + Byte32.size() + Uint32.size(),
      ),
      { validate: false },
    );
  }

  validate() {
    assertDataLength(this.view.byteLength, OutPoint.size());
    this.getTxHash().validate();
    this.getIndex().validate();
  }

  toObject() {
    return {
      tx_hash: this.getTxHash().toObject(),
      index: this.getIndex().toObject(),
    };
  }

  static size() {
    return 0 + Byte32.size() + Uint32.size();
  }
}

export function SerializeOutPoint(
  value: OutPoint | ReturnType<OutPoint["toObject"]>,
) {
  if (value instanceof OutPoint) return value.view.buffer;
  const array = new Uint8Array(0 + Byte32.size() + Uint32.size());
  array.set(new Uint8Array(SerializeByte32(value.tx_hash)), 0);
  array.set(new Uint8Array(SerializeUint32(value.index)), 0 + Byte32.size());
  return array.buffer;
}

export class CellInput {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  getSince() {
    return new Uint64(this.view.buffer.slice(0, 0 + Uint64.size()), {
      validate: false,
    });
  }

  getPreviousOutput() {
    return new OutPoint(
      this.view.buffer.slice(
        0 + Uint64.size(),
        0 + Uint64.size() + OutPoint.size(),
      ),
      { validate: false },
    );
  }

  validate() {
    assertDataLength(this.view.byteLength, CellInput.size());
    this.getSince().validate();
    this.getPreviousOutput().validate();
  }

  toObject() {
    return {
      since: this.getSince().toObject(),
      previous_output: this.getPreviousOutput().toObject(),
    };
  }

  static size() {
    return 0 + Uint64.size() + OutPoint.size();
  }
}

export function SerializeCellInput(
  value: CellInput | ReturnType<CellInput["toObject"]>,
) {
  if (value instanceof CellInput) return value.view.buffer;
  const array = new Uint8Array(0 + Uint64.size() + OutPoint.size());
  array.set(new Uint8Array(SerializeUint64(value.since)), 0);
  array.set(
    new Uint8Array(SerializeOutPoint(value.previous_output)),
    0 + Uint64.size(),
  );
  return array.buffer;
}

export class CellInputVec {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    if (this.view.byteLength < 4) {
      dataLengthError(this.view.byteLength, ">4");
    }
    const requiredByteLength = this.length() * CellInput.size() + 4;
    assertDataLength(this.view.byteLength, requiredByteLength);
    for (let i = 0; i < 0; i++) {
      const item = this.indexAt(i);
      item.validate();
    }
  }

  indexAt(i: number) {
    return new CellInput(
      this.view.buffer.slice(
        4 + i * CellInput.size(),
        4 + (i + 1) * CellInput.size(),
      ),
      { validate: false },
    );
  }

  toObject() {
    const len = this.length();
    const rv: ReturnType<CellInput["toObject"]>[] = [];
    for (let i = 0; i < len; i++) {
      rv.push(this.indexAt(i).toObject());
    }
    return rv;
  }

  length() {
    return this.view.getUint32(0, true);
  }
}

export function SerializeCellInputVec(
  value: CellInputVec | ReturnType<CellInputVec["toObject"]>,
) {
  if (value instanceof CellInputVec) return value.view.buffer;
  const array = new Uint8Array(4 + CellInput.size() * value.length);
  new DataView(array.buffer).setUint32(0, value.length, true);
  for (let i = 0; i < value.length; i++) {
    const itemBuffer = SerializeCellInput(value[i]);
    array.set(new Uint8Array(itemBuffer), 4 + i * CellInput.size());
  }
  return array.buffer;
}

export class CellOutput {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    const offsets = verifyAndExtractOffsets(this.view, 0, true);
    new Uint64(this.view.buffer.slice(offsets[0], offsets[1]), {
      validate: false,
    }).validate();
    new Script(this.view.buffer.slice(offsets[1], offsets[2]), {
      validate: false,
    }).validate();
    new ScriptOpt(this.view.buffer.slice(offsets[2], offsets[3]), {
      validate: false,
    }).validate();
  }

  getCapacity() {
    const start = 4;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new Uint64(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getLock() {
    const start = 8;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new Script(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getType() {
    const start = 12;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.byteLength;
    return new ScriptOpt(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  toObject() {
    return {
      capacity: this.getCapacity().toObject(),
      lock: this.getLock().toObject(),
      type: this.getType().toObject(),
    };
  }
}

export function SerializeCellOutput(
  value: CellOutput | ReturnType<CellOutput["toObject"]>,
) {
  if (value instanceof CellOutput) return value.view.buffer;
  const buffers = [];
  buffers.push(SerializeUint64(value.capacity));
  buffers.push(SerializeScript(value.lock));
  buffers.push(SerializeScriptOpt(value.type));
  return serializeTable(buffers);
}

export class CellOutputVec {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    const offsets = verifyAndExtractOffsets(this.view, 0, true);
    for (let i = 0; i < offsets.length - 1; i++) {
      new CellOutput(this.view.buffer.slice(offsets[i], offsets[i + 1]), {
        validate: false,
      }).validate();
    }
  }

  length() {
    if (this.view.byteLength < 8) {
      return 0;
    } else {
      return this.view.getUint32(4, true) / 4 - 1;
    }
  }

  indexAt(i: number) {
    const start = 4 + i * 4;
    const offset = this.view.getUint32(start, true);
    let offset_end = this.view.byteLength;
    if (i + 1 < this.length()) {
      offset_end = this.view.getUint32(start + 4, true);
    }
    return new CellOutput(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  toObject() {
    const len = this.length();
    const rv: ReturnType<CellOutput["toObject"]>[] = [];
    for (let i = 0; i < len; i++) {
      rv.push(this.indexAt(i).toObject());
    }
    return rv;
  }
}

export function SerializeCellOutputVec(
  value: CellOutputVec | ReturnType<CellOutputVec["toObject"]>,
) {
  if (value instanceof CellOutputVec) return value.view.buffer;
  return serializeTable(value.map((item) => SerializeCellOutput(item)));
}

export class CellDep {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  getOutPoint() {
    return new OutPoint(this.view.buffer.slice(0, 0 + OutPoint.size()), {
      validate: false,
    });
  }

  getDepType() {
    return this.view.getUint8(0 + OutPoint.size());
  }

  validate() {
    assertDataLength(this.view.byteLength, CellDep.size());
    this.getOutPoint().validate();
  }

  toObject() {
    return {
      out_point: this.getOutPoint().toObject(),
      dep_type: this.getDepType(),
    };
  }

  static size() {
    return 0 + OutPoint.size() + 1;
  }
}

export function SerializeCellDep(
  value: CellDep | ReturnType<CellDep["toObject"]>,
) {
  if (value instanceof CellDep) return value.view.buffer;
  const array = new Uint8Array(0 + OutPoint.size() + 1);
  array.set(new Uint8Array(SerializeOutPoint(value.out_point)), 0);
  const view = new DataView(array.buffer);
  view.setUint8(0 + OutPoint.size(), fromStringEnum(value.dep_type));
  return array.buffer;
}

export class CellDepVec {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    if (this.view.byteLength < 4) {
      dataLengthError(this.view.byteLength, ">4");
    }
    const requiredByteLength = this.length() * CellDep.size() + 4;
    assertDataLength(this.view.byteLength, requiredByteLength);
    for (let i = 0; i < 0; i++) {
      const item = this.indexAt(i);
      item.validate();
    }
  }

  indexAt(i: number) {
    return new CellDep(
      this.view.buffer.slice(
        4 + i * CellDep.size(),
        4 + (i + 1) * CellDep.size(),
      ),
      { validate: false },
    );
  }

  toObject() {
    const len = this.length();
    const rv: ReturnType<CellDep["toObject"]>[] = [];
    for (let i = 0; i < len; i++) {
      rv.push(this.indexAt(i).toObject());
    }
    return rv;
  }

  length() {
    return this.view.getUint32(0, true);
  }
}

export function SerializeCellDepVec(
  value: CellDepVec | ReturnType<CellDepVec["toObject"]>,
) {
  if (value instanceof CellDepVec) return value.view.buffer;
  const array = new Uint8Array(4 + CellDep.size() * value.length);
  new DataView(array.buffer).setUint32(0, value.length, true);
  for (let i = 0; i < value.length; i++) {
    const itemBuffer = SerializeCellDep(value[i]);
    array.set(new Uint8Array(itemBuffer), 4 + i * CellDep.size());
  }
  return array.buffer;
}

export class RawTransaction {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    const offsets = verifyAndExtractOffsets(this.view, 0, true);
    new Uint32(this.view.buffer.slice(offsets[0], offsets[1]), {
      validate: false,
    }).validate();
    new CellDepVec(this.view.buffer.slice(offsets[1], offsets[2]), {
      validate: false,
    }).validate();
    new Byte32Vec(this.view.buffer.slice(offsets[2], offsets[3]), {
      validate: false,
    }).validate();
    new CellInputVec(this.view.buffer.slice(offsets[3], offsets[4]), {
      validate: false,
    }).validate();
    new CellOutputVec(this.view.buffer.slice(offsets[4], offsets[5]), {
      validate: false,
    }).validate();
    new BytesVec(this.view.buffer.slice(offsets[5], offsets[6]), {
      validate: false,
    }).validate();
  }

  getVersion() {
    const start = 4;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new Uint32(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getCellDeps() {
    const start = 8;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new CellDepVec(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getHeaderDeps() {
    const start = 12;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new Byte32Vec(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getInputs() {
    const start = 16;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new CellInputVec(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getOutputs() {
    const start = 20;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new CellOutputVec(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getOutputsData() {
    const start = 24;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.byteLength;
    return new BytesVec(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  toObject() {
    return {
      version: this.getVersion().toObject(),
      cell_deps: this.getCellDeps().toObject(),
      header_deps: this.getHeaderDeps().toObject(),
      inputs: this.getInputs().toObject(),
      outputs: this.getOutputs().toObject(),
      outputs_data: this.getOutputsData().toObject(),
    };
  }
}

export function SerializeRawTransaction(
  value: RawTransaction | ReturnType<RawTransaction["toObject"]>,
) {
  if (value instanceof RawTransaction) return value.view.buffer;
  const buffers = [];
  buffers.push(SerializeUint32(value.version));
  buffers.push(SerializeCellDepVec(value.cell_deps));
  buffers.push(SerializeByte32Vec(value.header_deps));
  buffers.push(SerializeCellInputVec(value.inputs));
  buffers.push(SerializeCellOutputVec(value.outputs));
  buffers.push(SerializeBytesVec(value.outputs_data));
  return serializeTable(buffers);
}

export class Transaction {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    const offsets = verifyAndExtractOffsets(this.view, 0, true);
    new RawTransaction(this.view.buffer.slice(offsets[0], offsets[1]), {
      validate: false,
    }).validate();
    new BytesVec(this.view.buffer.slice(offsets[1], offsets[2]), {
      validate: false,
    }).validate();
  }

  getRaw() {
    const start = 4;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new RawTransaction(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getWitnesses() {
    const start = 8;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.byteLength;
    return new BytesVec(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  toObject() {
    return {
      raw: this.getRaw().toObject(),
      witnesses: this.getWitnesses().toObject(),
    };
  }
}

export function SerializeTransaction(
  value: Transaction | ReturnType<Transaction["toObject"]>,
) {
  if (value instanceof Transaction) return value.view.buffer;
  const buffers = [];
  buffers.push(SerializeRawTransaction(value.raw));
  buffers.push(SerializeBytesVec(value.witnesses));
  return serializeTable(buffers);
}

export class WitnessArgs {
  private _view: DataView;

  get view() {
    return this._view;
  }

  constructor(reader: Reader, { validate = true } = {}) {
    this._view = new DataView(assertArrayBuffer(reader));
    if (validate) {
      this.validate();
    }
  }

  validate() {
    const offsets = verifyAndExtractOffsets(this.view, 0, true);
    new BytesOpt(this.view.buffer.slice(offsets[0], offsets[1]), {
      validate: false,
    }).validate();
    new BytesOpt(this.view.buffer.slice(offsets[1], offsets[2]), {
      validate: false,
    }).validate();
    new BytesOpt(this.view.buffer.slice(offsets[2], offsets[3]), {
      validate: false,
    }).validate();
  }

  getLock() {
    const start = 4;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new BytesOpt(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getInputType() {
    const start = 8;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.getUint32(start + 4, true);
    return new BytesOpt(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  getOutputType() {
    const start = 12;
    const offset = this.view.getUint32(start, true);
    const offset_end = this.view.byteLength;
    return new BytesOpt(this.view.buffer.slice(offset, offset_end), {
      validate: false,
    });
  }

  toObject() {
    return {
      lock: this.getLock().toObject(),
      input_type: this.getInputType().toObject(),
      output_type: this.getOutputType().toObject(),
    };
  }
}

export function SerializeWitnessArgs(
  value: WitnessArgs | ReturnType<WitnessArgs["toObject"]>,
) {
  if (value instanceof WitnessArgs) return value.view.buffer;
  const buffers = [];
  buffers.push(SerializeBytesOpt(value.lock));
  buffers.push(SerializeBytesOpt(value.input_type));
  buffers.push(SerializeBytesOpt(value.output_type));
  return serializeTable(buffers);
}
