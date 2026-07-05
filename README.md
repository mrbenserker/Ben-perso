# 🎲 Soirée Jeux

Web app (HTML/CSS/JS vanilla, sans framework ni build) pour organiser des soirées
jeux de société à partir de sa propre ludothèque.

## Fonctionnalités (v1)

- **Bibliothèque locale** : les jeux sont stockés dans le navigateur via IndexedDB,
  sans compte ni serveur.
- **Ajout via BoardGameGeek** : recherche par nom sur la
  [XML API 2 de BGG](https://boardgamegeek.com/wiki/page/BGG_XML_API2)
  (gratuite, sans clé), avec saisie manuelle en secours.
- **Filtres** : nombre de joueurs, âge minimum, durée de partie.
- **Suggestion de soirée** : indiquez le nombre de joueurs, l'âge du plus jeune
  et le temps disponible → l'app propose les jeux compatibles de votre bibliothèque.

## Lancer l'app

Les modules ES nécessitent un serveur HTTP (pas de `file://`) :

```bash
python3 -m http.server 8000
# ou : npx serve .
```

Puis ouvrir <http://localhost:8000>.

## Structure du projet

```
index.html            Page unique, contient les 3 vues (sections)
css/styles.css        Styles
js/
  app.js              Point d'entrée, navigation par hash entre les vues
  db.js               Wrapper IndexedDB (CRUD de la bibliothèque)
  bgg.js              Service API BoardGameGeek (fetch + parsing XML DOMParser)
  filters.js          Logique de filtrage partagée (joueurs / âge / durée)
  ui.js               Helpers de rendu (carte de jeu, statuts, échappement HTML)
  views/
    library.js        Vue Bibliothèque (liste + filtres + suppression)
    add-game.js       Vue Ajout (recherche BGG + formulaire manuel)
    suggest.js        Vue Suggestion de soirée
```

## Notes techniques

- **CORS / BGG** : l'API BGG ne renvoie pas toujours les en-têtes CORS. En cas
  d'échec du fetch direct, `js/bgg.js` retente automatiquement via le proxy
  public [allorigins](https://allorigins.win/). L'API peut aussi répondre
  `202 Accepted` (requête mise en file) : le service réessaie automatiquement.
- **Modèle de données** (store IndexedDB `games`) : `name`, `minPlayers`,
  `maxPlayers`, `minAge`, `playTime` (minutes), `yearPublished`, `bggId`,
  `thumbnail`, `addedAt`.
- Un critère de filtre laissé vide est ignoré ; un jeu sans info sur un champ
  (âge ou durée inconnus) n'est pas exclu par ce critère.
