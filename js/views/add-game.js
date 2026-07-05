/**
 * Vue Ajout : recherche BGG → pré-remplissage du formulaire, ou saisie manuelle.
 */
import { addGame, hasBggGame } from '../db.js';
import { searchGames, getGameDetails } from '../bgg.js';
import { numOrNull } from '../filters.js';
import { escapeHTML, setStatus } from '../ui.js';

const searchForm = document.getElementById('bgg-search-form');
const queryInput = document.getElementById('bgg-query');
const resultsList = document.getElementById('bgg-results');
const bggStatus = document.getElementById('bgg-status');
const addForm = document.getElementById('add-game-form');
const addStatus = document.getElementById('add-status');

function fillForm(details) {
  addForm.elements.bggId.value = details.bggId ?? '';
  addForm.elements.thumbnail.value = details.thumbnail ?? '';
  addForm.elements.name.value = details.name ?? '';
  addForm.elements.minPlayers.value = details.minPlayers ?? '';
  addForm.elements.maxPlayers.value = details.maxPlayers ?? '';
  addForm.elements.minAge.value = details.minAge ?? '';
  addForm.elements.playTime.value = details.playTime ?? '';
  addForm.elements.yearPublished.value = details.yearPublished ?? '';
}

async function handleSearch(event) {
  event.preventDefault();
  const query = queryInput.value.trim();
  if (!query) return;

  resultsList.replaceChildren();
  setStatus(bggStatus, 'Recherche sur BoardGameGeek…');

  let results;
  try {
    results = await searchGames(query);
  } catch (err) {
    setStatus(bggStatus, `Recherche impossible : ${err.message} Utilisez la saisie manuelle.`, 'status-error');
    return;
  }

  if (results.length === 0) {
    setStatus(bggStatus, 'Aucun résultat. Vérifiez l’orthographe (BGG connaît surtout les titres anglais) ou saisissez le jeu à la main.');
    return;
  }

  setStatus(bggStatus, `${results.length} résultat${results.length > 1 ? 's' : ''} — cliquez pour pré-remplir le formulaire.`);

  // On limite l'affichage aux 20 premiers résultats.
  resultsList.replaceChildren(
    ...results.slice(0, 20).map((result) => {
      const li = document.createElement('li');
      li.innerHTML = `${escapeHTML(result.name)} ${
        result.yearPublished ? `<span class="result-year">(${result.yearPublished})</span>` : ''
      }`;
      li.addEventListener('click', () => selectResult(result, li));
      return li;
    })
  );
}

async function selectResult(result) {
  setStatus(bggStatus, `Chargement de « ${result.name} »…`);
  try {
    const details = await getGameDetails(result.bggId);
    fillForm(details);
    setStatus(bggStatus, 'Formulaire pré-rempli, vérifiez puis validez. ✓', 'status-success');
    addForm.elements.name.focus();
  } catch (err) {
    setStatus(bggStatus, `Chargement impossible : ${err.message}`, 'status-error');
  }
}

async function handleAdd(event) {
  event.preventDefault();
  const data = new FormData(addForm);

  const game = {
    name: data.get('name').trim(),
    minPlayers: numOrNull(data.get('minPlayers')),
    maxPlayers: numOrNull(data.get('maxPlayers')),
    minAge: numOrNull(data.get('minAge')),
    playTime: numOrNull(data.get('playTime')),
    yearPublished: numOrNull(data.get('yearPublished')),
    bggId: numOrNull(data.get('bggId')),
    thumbnail: data.get('thumbnail') || null,
  };

  if (!game.name) return;
  if (game.minPlayers != null && game.maxPlayers != null && game.minPlayers > game.maxPlayers) {
    setStatus(addStatus, 'Le nombre de joueurs min. ne peut pas dépasser le max.', 'status-error');
    return;
  }
  if (await hasBggGame(game.bggId)) {
    setStatus(addStatus, 'Ce jeu BGG est déjà dans votre bibliothèque.', 'status-error');
    return;
  }

  await addGame(game);
  addForm.reset();
  resultsList.replaceChildren();
  setStatus(bggStatus, '');
  setStatus(addStatus, `« ${game.name} » ajouté à votre bibliothèque ! ✓`, 'status-success');
}

export function initAddGameView() {
  searchForm.addEventListener('submit', handleSearch);
  addForm.addEventListener('submit', handleAdd);
  addForm.addEventListener('reset', () => {
    addForm.elements.bggId.value = '';
    addForm.elements.thumbnail.value = '';
    setStatus(addStatus, '');
  });
}
