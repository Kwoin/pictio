import { LABELS as FR_LABELS } from "./fr.js";

export function label(key) {
  return getLanguage()[key];
}

function getLanguage() {
  return FR_LABELS;
}
