/**
 * Registre des parties en cours par id
 * @type {Map<number, { users: WebSocket[], owner: WebSocket } >}
 */
export const gameRegistry = new Map();

/**
 * Registre des utilisateurs connectés
 * @type {Map<WebSocket, User>}
 */
export const userRegistry = new Map();

/**
 * Registre des images par game_id
 * @type {Map<number, Picture[]>}
 */
export const imageRegistry = new Map();
