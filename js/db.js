/**
 * Wrapper IndexedDB pour la bibliothèque de jeux.
 *
 * Un jeu a la forme :
 * {
 *   id: number (auto-généré),
 *   name: string,
 *   minPlayers: number,
 *   maxPlayers: number,
 *   minAge: number | null,
 *   playTime: number | null,   // durée d'une partie en minutes
 *   yearPublished: number | null,
 *   bggId: number | null,      // id BoardGameGeek si importé
 *   thumbnail: string | null,  // URL de la vignette BGG
 *   addedAt: string            // ISO date
 * }
 */

const DB_NAME = 'soiree-jeux';
const DB_VERSION = 1;
const STORE_GAMES = 'games';

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_GAMES)) {
        const store = db.createObjectStore(STORE_GAMES, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('bggId', 'bggId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

/** Exécute `fn(store)` dans une transaction et renvoie le résultat de la requête. */
async function withStore(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_GAMES, mode);
    const request = fn(tx.objectStore(STORE_GAMES));
    tx.oncomplete = () => resolve(request.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** Ajoute un jeu et renvoie son id. */
export function addGame(game) {
  return withStore('readwrite', (store) =>
    store.add({ ...game, addedAt: new Date().toISOString() })
  );
}

/** Renvoie tous les jeux, triés par nom. */
export async function getAllGames() {
  const games = await withStore('readonly', (store) => store.getAll());
  return games.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

/** Supprime un jeu par id. */
export function deleteGame(id) {
  return withStore('readwrite', (store) => store.delete(id));
}

/** Renvoie true si un jeu avec ce bggId existe déjà. */
export async function hasBggGame(bggId) {
  if (!bggId) return false;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_GAMES, 'readonly');
    const index = tx.objectStore(STORE_GAMES).index('bggId');
    const request = index.get(bggId);
    request.onsuccess = () => resolve(request.result !== undefined);
    request.onerror = () => reject(request.error);
  });
}
