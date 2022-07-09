import { deepEquals } from "../../common/utils";

function getDefaultStorage() {
  return window.location.host.startsWith("localhost:") ? "sessionStorage" : "localStorage";
}

export function storageGet<T>(key: string, storage: "localStorage" | "sessionStorage" = getDefaultStorage()): T {
  if (!key) return null;
  const value = window[storage]?.getItem(key);
  return value == null ? null : JSON.parse(value);
}

export function storageSet<T>(key: string, value: T, storage: "localStorage" | "sessionStorage" = getDefaultStorage()): void {
  if (!key) return;
  window[storage]?.setItem(key, JSON.stringify(value));
}

export function storageClear(key: string, storage: "localStorage" | "sessionStorage" = getDefaultStorage()): void {
  if (!key) return;
  window[storage].removeItem(key);
}

export function storageAdd<T>(key: string, value: T, unique = true, storage: "localStorage" | "sessionStorage" = getDefaultStorage()) {
  if (!key) return;
  const arr = storageGet(key, storage);
  if (!Array.isArray(arr)) return;
  if (unique && arr.some(item => deepEquals(item, value))) return;
  arr.push(value);
  storageSet(key, arr, storage);
}

export function storageInclude<T>(key: string, value: T, storage: "localStorage" | "sessionStorage" = getDefaultStorage()): boolean {
  if (!key) return false;
  const values = storageGet(key, storage);
  if (!Array.isArray(values)) return;
  return values.some(item => deepEquals(item, value));
}

export function storageRemove<T>(key: string, value: T, storage: "localStorage" | "sessionStorage" = getDefaultStorage()): void {
  if (!key) return;
  const arr = storageGet(key, storage);
  if (!Array.isArray(arr)) return;
  const newArr = arr.filter(item => deepEquals(item, value));
  storageSet(key, newArr, storage);
}
