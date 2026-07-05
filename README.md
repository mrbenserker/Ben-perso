# 🎲 Soirée Jeux

Web app (HTML/CSS/JS vanilla, sans framework ni build) organisée comme une
app mobile — navigation par onglets en bas, écrans plein écran, installable
sur l'écran d'accueil (PWA) — pour organiser des soirées jeux de société à
partir de sa propre ludothèque.

## Fonctionnalités (v1)

- **Interface mobile** : navigation par barre d'onglets en bas d'écran,
  écrans plein écran avec transitions, installable en PWA (icône sur l'écran
  d'accueil, fonctionne hors-ligne pour l'interface grâce à un service worker).
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
index.html            Page unique : cadre d'app + 3 écrans (sections) + nav basse
manifest.webmanifest  Manifeste PWA (nom, icône, thème, mode standalone)
sw.js                 Service worker : cache la coquille de l'app pour le hors-ligne
assets/icon.svg       Icône de l'app (favicon, PWA, apple-touch-icon)
css/styles.css        Styles (mise en page mobile, thème clair/sombre)
js/
  app.js              Point d'entrée, navigation par hash + enregistrement du service worker
  db.js               Wrapper IndexedDB (CRUD de la bibliothèque)
  bgg.js              Service API BoardGameGeek (fetch + parsing XML DOMParser)
  filters.js          Logique de filtrage partagée (joueurs / âge / durée)
  ui.js               Helpers de rendu (carte de jeu, statuts, échappement HTML)
  views/
    library.js        Écran Bibliothèque (liste + filtres + suppression)
    add-game.js       Écran Ajout (recherche BGG + formulaire manuel)
    suggest.js        Écran Suggestion de soirée
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
- **Présentation mobile** : sur un écran de smartphone, l'app occupe tout
  l'espace (edge-to-edge). Sur desktop, elle s'affiche dans un cadre façon
  téléphone pour rester lisible en aperçu.
- **Icône iOS** : l'icône est fournie en SVG (`assets/icon.svg`). Safari iOS ne
  supporte pas toujours le SVG pour l'icône d'écran d'accueil ; pour un rendu
  garanti sur iOS, exportez `icon.svg` en PNG (192×192 et 512×512) et
  référencez-les dans `manifest.webmanifest` et la balise `apple-touch-icon`.
