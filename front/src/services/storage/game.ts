import { storageAdd, storageClear, storageGet, storageInclude, storageRemove, storageSet } from "./storage";
import { get } from "svelte/store";
import { game, me } from "../store/game";
import type { GameData } from "../../model/storage";

const KEY_PICTURE_LIKE = "piktink-picture-like"
const KEY_GAME_DATA = "piktink-game"

export function addPictureLike(id: number): void {
  if (!id) return;
  storageAdd(KEY_PICTURE_LIKE, id);
}

export function removePictureLike(id: number): void {
  if (!id) return;
  storageRemove(KEY_PICTURE_LIKE, id);
}

export function isPictureLiked(id: number): boolean {
  if (!id) return false;
  return storageInclude(KEY_PICTURE_LIKE, id);
}

export function getStorageGame(): GameData {
  return storageGet(KEY_GAME_DATA);
}

export function clearStorageGame(): void {
  return storageClear(KEY_GAME_DATA);
}

export function saveStorageGame(): void {
  console.log("saveStorageGame");
  const g = get(game);
  const u = get(me);
  if (g == null || u == null) return;
  storageSet(KEY_GAME_DATA, {game: g, user: u});
}
