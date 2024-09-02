export function parseNumber(value: string | undefined): number | undefined {
  return value != null &&
    /^\s*[-+]?(\d+(\.\d*)?|\.\d+)(e[-+]?\d+)?\s*$/i.test(value)
    ? parseFloat(value)
    : undefined
}
