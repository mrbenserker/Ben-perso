/**
 * Point d'entrée : navigation par hash entre les trois vues.
 */
import { initLibraryView, renderLibrary } from './views/library.js';
import { initAddGameView } from './views/add-game.js';
import { initSuggestView } from './views/suggest.js';

const VIEWS = ['bibliotheque', 'ajout', 'suggestion'];
const DEFAULT_VIEW = 'bibliotheque';

function showView(name) {
  const view = VIEWS.includes(name) ? name : DEFAULT_VIEW;

  for (const v of VIEWS) {
    document.getElementById(`view-${v}`).hidden = v !== view;
  }
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === view);
  }

  // La bibliothèque se rafraîchit à chaque affichage (jeux ajoutés entre-temps).
  if (view === 'bibliotheque') {
    renderLibrary();
  }
}

function handleHashChange() {
  showView(location.hash.replace('#', ''));
}

initLibraryView();
initAddGameView();
initSuggestView();

window.addEventListener('hashchange', handleHashChange);
handleHashChange();
