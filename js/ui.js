/**
 * Petits helpers de rendu partagés entre les vues.
 */

/** Échappe une chaîne pour insertion dans du HTML. */
export function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

/** Construit le <li> d'un jeu (bibliothèque ou suggestion). */
export function createGameItem(game, { onDelete = null } = {}) {
  const li = document.createElement('li');
  li.className = 'game-item';

  const meta = [];
  if (game.minPlayers != null || game.maxPlayers != null) {
    const min = game.minPlayers ?? '?';
    const max = game.maxPlayers ?? '?';
    meta.push(min === max ? `${min} joueurs` : `${min}–${max} joueurs`);
  }
  if (game.minAge != null) meta.push(`${game.minAge} ans et +`);
  if (game.playTime != null) meta.push(`~${game.playTime} min`);
  if (game.yearPublished != null) meta.push(`(${game.yearPublished})`);

  const thumb = game.thumbnail
    ? `<img src="${escapeHTML(game.thumbnail)}" alt="" loading="lazy">`
    : '<div class="thumb-placeholder">🎲</div>';

  li.innerHTML = `
    ${thumb}
    <div class="game-info">
      <p class="game-name">${escapeHTML(game.name)}</p>
      <p class="game-meta">${escapeHTML(meta.join(' · '))}</p>
    </div>
  `;

  if (onDelete) {
    const btn = document.createElement('button');
    btn.className = 'btn-danger';
    btn.textContent = 'Supprimer';
    btn.addEventListener('click', () => onDelete(game));
    li.appendChild(btn);
  }

  return li;
}

/** Affiche un message de statut dans un élément, avec une classe optionnelle. */
export function setStatus(el, message, type = '') {
  el.hidden = !message;
  el.textContent = message ?? '';
  el.className = `muted ${type}`.trim();
}
