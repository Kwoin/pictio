export function deepEquals<T>(expected: T, actual: T): boolean {
  if (actual == null) return expected == null;
  if (expected == null) return false;
  if (typeof expected === "object") {
    if (typeof actual !== "object") return false;
    const expectedKeys = Object.keys(expected);
    const actualKeys = Object.keys(actual);
    if (expectedKeys.length !== actualKeys.length) return false;
    for (let expectedKey of expectedKeys) {
      if (!deepEquals(expected[expectedKey], actual[expectedKey])) return false;
    }
    return true;
  }
  return expected === actual;
}

export function isDevMode(): boolean {
  return process.env.NODE_ENV === "development";
}

export function isProdMode(): boolean {
  return process.env.NODE_ENV === "production";
}
