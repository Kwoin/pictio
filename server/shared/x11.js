/**
 *
 * @type {string[]}
 */
export const x11 = [
    "aliceblue",
    "antiquewhite",
    "aqua",
    "aquamarine",
    "brown",
    "burlywood",
    "chartreuse",
    "coral",
    "cornsilk",
    "darkorange",
    "darksalmon",
    "deeppink",
    "fuchsia",
    "gainsboro",
    "ghostwhite",
    "gold",
    "goldenrod",
    "greenyellow",
    "khaki",
    "lavender",
    "lawngreen",
    "lightcyan",
    "lightgreen",
    "lightgrey",
    "lime",
    "magenta",
    "mediumspringgreen",
    "mistyrose",
    "pink",
    "red",
    "snow",
    "turquoise",
    "violet",
    "yellow"
]

/**
 * Obtenir une couleur aléatoire parmi la sélection x11
 * @returns {string}
 */
export function getRandomColor() {
    const r = Math.floor(Math.random() * x11.length);
    return x11[r];
}
