import { BI, BIish, formatUnit } from "@ckb-lumos/bi";
import numbro from "numbro";

export function toReadableAmount(value?: BIish) {
  if (!value) return formatUnit(BI.from(0), "ckb");
  return formatUnit(value, "ckb");
}

export function mulPrice(price: number, value?: BI): number {
  if (!value) return 0;
  return value.div(BI.from(10 ** 8)).toNumber() * price;
}

export function formatCurrency(value: number, decimals = 2) {
  return numbro(value).format({ thousandSeparated: true, mantissa: decimals });
}
