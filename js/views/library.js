/**
 * Vue Bibliothèque : liste des jeux avec filtres (joueurs, âge, durée).
 */
import { getAllGames, deleteGame } from '../db.js';
import { matchesCriteria, numOrNull } from '../filters.js';
import { createGameItem } from '../ui.js';

const list = document.getElementById('library-list');
const emptyMsg = document.getElementById('library-empty');
const countMsg = document.getElementById('library-count');
const filtersForm = document.getElementById('library-filters');

function readFilters() {
  const data = new FormData(filtersForm);
  return {
    players: numOrNull(data.get('players')),
    maxAge: numOrNull(data.get('maxAge')),
    maxDuration: numOrNull(data.get('maxDuration')),
  };
}

export async function renderLibrary() {
  const games = await getAllGames();
  const filtered = games.filter((g) => matchesCriteria(g, readFilters()));

  list.replaceChildren(
    ...filtered.map((game) =>
      createGameItem(game, {
        onDelete: async () => {
          if (confirm(`Supprimer « ${game.name} » de votre bibliothèque ?`)) {
            await deleteGame(game.id);
            renderLibrary();
          }
        },
      })
    )
  );

  emptyMsg.hidden = games.length > 0;
  countMsg.textContent =
    games.length === 0
      ? ''
      : filtered.length === games.length
        ? `${games.length} jeu${games.length > 1 ? 'x' : ''}`
        : `${filtered.length} jeu${filtered.length > 1 ? 'x' : ''} sur ${games.length} (filtres actifs)`;
}

export function initLibraryView() {
  filtersForm.addEventListener('input', renderLibrary);
  filtersForm.addEventListener('reset', () => {
    // Attendre que le reset ait vidé les champs avant de re-rendre.
    setTimeout(renderLibrary, 0);
  });
}
