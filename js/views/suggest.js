/**
 * Vue Suggestion : à partir des critères de la soirée (joueurs, âge, temps),
 * propose les jeux compatibles de la bibliothèque.
 */
import { getAllGames } from '../db.js';
import { matchesCriteria, numOrNull } from '../filters.js';
import { createGameItem } from '../ui.js';

const form = document.getElementById('suggest-form');
const wrapper = document.getElementById('suggest-results-wrapper');
const title = document.getElementById('suggest-title');
const list = document.getElementById('suggest-results');
const emptyMsg = document.getElementById('suggest-empty');

async function handleSuggest(event) {
  event.preventDefault();
  const data = new FormData(form);
  const criteria = {
    players: numOrNull(data.get('players')),
    maxAge: numOrNull(data.get('youngestAge')),
    maxDuration: numOrNull(data.get('availableTime')),
  };

  const games = await getAllGames();
  const compatible = games.filter((g) => matchesCriteria(g, criteria));

  // Les jeux les plus proches de la durée disponible en premier
  // (on remplit au mieux la soirée), sinon ordre alphabétique.
  if (criteria.maxDuration != null) {
    compatible.sort((a, b) => (b.playTime ?? 0) - (a.playTime ?? 0));
  }

  wrapper.hidden = false;
  emptyMsg.hidden = compatible.length > 0;
  title.textContent =
    compatible.length > 0
      ? `${compatible.length} jeu${compatible.length > 1 ? 'x' : ''} pour votre soirée 🎉`
      : '';

  list.replaceChildren(...compatible.map((game) => createGameItem(game)));
}

export function initSuggestView() {
  form.addEventListener('submit', handleSuggest);
}
