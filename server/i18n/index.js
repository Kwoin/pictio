import { FR } from "./fr.js";

export function label(key) {
  return getLanguage().LABEL[key];
}

export function getWords() {
  return getLanguage().WORDS;
}

function getLanguage() {
  return FR;
}
