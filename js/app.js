/**
 * Point d'entrée : navigation par hash entre les trois écrans,
 * pilotée par la barre de navigation basse (façon app mobile).
 */
import { initLibraryView, renderLibrary } from './views/library.js';
import { initAddGameView } from './views/add-game.js';
import { initSuggestView } from './views/suggest.js';

const VIEWS = ['bibliotheque', 'ajout', 'suggestion'];
const DEFAULT_VIEW = 'bibliotheque';
const screenTitle = document.getElementById('screen-title');

function showView(name) {
  const view = VIEWS.includes(name) ? name : DEFAULT_VIEW;

  for (const v of VIEWS) {
    document.getElementById(`view-${v}`).hidden = v !== view;
  }

  for (const item of document.querySelectorAll('.nav-item')) {
    const isActive = item.dataset.view === view;
    item.classList.toggle('active', isActive);
    if (isActive) screenTitle.textContent = item.dataset.title;
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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // L'app reste utilisable en ligne sans le mode hors-ligne.
    });
  });
}
