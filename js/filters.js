/**
 * Logique de filtrage partagée entre la vue Bibliothèque et la vue Suggestion.
 */

/**
 * @param {object} game jeu de la bibliothèque
 * @param {object} criteria
 * @param {number|null} criteria.players      nombre de joueurs souhaité
 * @param {number|null} criteria.maxAge       âge du plus jeune joueur (le minAge du jeu doit être ≤)
 * @param {number|null} criteria.maxDuration  durée max en minutes (le playTime du jeu doit être ≤)
 * @returns {boolean} true si le jeu est compatible avec les critères
 *
 * Un critère vide (null/undefined) est ignoré. Un jeu sans info sur un
 * champ (minAge ou playTime absent) n'est pas exclu par ce critère.
 */
export function matchesCriteria(game, { players = null, maxAge = null, maxDuration = null }) {
  if (players != null) {
    if (game.minPlayers != null && players < game.minPlayers) return false;
    if (game.maxPlayers != null && players > game.maxPlayers) return false;
  }
  if (maxAge != null && game.minAge != null && game.minAge > maxAge) {
    return false;
  }
  if (maxDuration != null && game.playTime != null && game.playTime > maxDuration) {
    return false;
  }
  return true;
}

/** Lit un champ numérique de formulaire ; renvoie null si vide. */
export function numOrNull(value) {
  const n = Number(value);
  return value === '' || value == null || Number.isNaN(n) ? null : n;
}
