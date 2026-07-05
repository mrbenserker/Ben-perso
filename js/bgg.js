/**
 * Service BoardGameGeek — XML API 2 (gratuite, sans clé).
 * Doc : https://boardgamegeek.com/wiki/page/BGG_XML_API2
 *
 * Le XML est parsé avec DOMParser (natif navigateur).
 * L'API BGG n'envoie pas toujours les en-têtes CORS : en cas d'échec
 * du fetch direct, on retente via un proxy CORS public (allorigins).
 */

const BGG_BASE = 'https://boardgamegeek.com/xmlapi2';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

/** Fetch le XML d'une URL BGG et le renvoie en Document.
 *  Gère le statut 202 (requête mise en file par BGG → réessayer). */
async function fetchXML(url, { retries = 3 } = {}) {
  let response;
  try {
    response = await fetch(url);
  } catch {
    // Échec réseau probable = CORS bloqué → on passe par le proxy.
    response = await fetch(CORS_PROXY + encodeURIComponent(url));
  }

  if (response.status === 202) {
    if (retries <= 0) {
      throw new Error('BGG met trop de temps à préparer la réponse, réessayez.');
    }
    await new Promise((r) => setTimeout(r, 1500));
    return fetchXML(url, { retries: retries - 1 });
  }

  if (!response.ok) {
    throw new Error(`Erreur BGG (HTTP ${response.status})`);
  }

  const text = await response.text();
  const doc = new DOMParser().parseFromString(text, 'text/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('Réponse BGG illisible (XML invalide).');
  }
  return doc;
}

/**
 * Recherche des jeux par nom.
 * @returns {Promise<Array<{bggId: number, name: string, yearPublished: number|null}>>}
 */
export async function searchGames(query) {
  const url = `${BGG_BASE}/search?type=boardgame&query=${encodeURIComponent(query)}`;
  const doc = await fetchXML(url);

  return [...doc.querySelectorAll('item')].map((item) => ({
    bggId: Number(item.getAttribute('id')),
    name: item.querySelector('name')?.getAttribute('value') ?? 'Sans nom',
    yearPublished:
      Number(item.querySelector('yearpublished')?.getAttribute('value')) || null,
  }));
}

/**
 * Récupère le détail d'un jeu par son id BGG.
 * @returns {Promise<{bggId, name, minPlayers, maxPlayers, minAge, playTime, yearPublished, thumbnail}>}
 */
export async function getGameDetails(bggId) {
  const url = `${BGG_BASE}/thing?id=${bggId}`;
  const doc = await fetchXML(url);

  const item = doc.querySelector('item');
  if (!item) {
    throw new Error(`Jeu BGG introuvable (id ${bggId}).`);
  }

  const attrValue = (selector) =>
    Number(item.querySelector(selector)?.getAttribute('value')) || null;

  // Le nom principal est celui avec type="primary".
  const name =
    item.querySelector('name[type="primary"]')?.getAttribute('value') ??
    item.querySelector('name')?.getAttribute('value') ??
    'Sans nom';

  return {
    bggId,
    name,
    minPlayers: attrValue('minplayers'),
    maxPlayers: attrValue('maxplayers'),
    minAge: attrValue('minage'),
    playTime: attrValue('playingtime'),
    yearPublished: attrValue('yearpublished'),
    thumbnail: item.querySelector('thumbnail')?.textContent?.trim() || null,
  };
}
