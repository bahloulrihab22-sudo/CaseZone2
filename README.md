# CaseZone — Mini-projet Angular

Rihab Bahloul et Wissal Barhoumi — DSI 21 — Groupe 1.

## Démarrer

Prérequis : Node.js 22.12+ (ou Node.js 24) et Angular CLI.
Dans le dossier `Projet_Bahloul`, installer une fois les dépendances :

```sh
npm ci
```

Terminal 1 — laisser le serveur de données ouvert :

```sh
npm run api
```

Terminal 2 — lancement Angular habituel :

```sh
ng serve -o
```

L'application s'ouvre sur http://localhost:4200.
Si le port est occupé : `ng serve -o --port 4201`.
Si la commande globale `ng` n'est pas disponible : `npm start -- -o`.
Après la mise à jour des dépendances, arrêter l'ancien serveur Angular puis le relancer.

## Compte de démonstration

- Login : `admin`
- Mot de passe initial : `CaseZone2026!`

Le changement de mot de passe est enregistré dans `bd.json`.
La session est en mémoire : un rechargement complet demande une nouvelle connexion.
Une navigation entre le catalogue et l'administration conserve la session.
Les données sont des exemples fictifs. Les images sont des illustrations locales.

## Fonctionnalités

| Exigence | Réalisation |
| --- | --- |
| 1.1 Consulter, ajouter, modifier, supprimer | Catalogue administrateur, formulaire commun ajout/modification, confirmation de suppression |
| 1.2 Recherche administrateur | Recherche par nom |
| 1.3 Authentification | Vérification du compte du serveur JSON ; gestion affichée après connexion |
| 1.4 Changer le mot de passe | Vérification de l'ancien, validation et confirmation du nouveau |
| 1.5 Fonctionnalité de la fiche | Tableau de bord : total, disponibles, épuisées |
| 2.1 Liste partielle | Cartes de coques dans un composant enfant |
| 2.2 Détail complet | Route `/coques/:id`, tous les champs et commentaires |
| 2.3 Deux critères combinables | Nom et disponibilité, ensemble ou séparément |
| 2.4 Informations statiques | Page `/infos` et auteures du projet |
| 2.5 Fonctionnalité de la fiche | Ajouter une note et un commentaire persistants |

Le tri supplémentaire et la normalisation des accents ont été retirés afin de
garder la recherche simple et centrée sur l'énoncé.

## Notions utilisées

- Interfaces `Coque`, `Commentaire`, `CompteAdministrateur` de la fiche.
- `signal`, `computed`, `set`, `update`, `asReadonly`.
- Services injectés avec `inject`.
- Liste parent et carte enfant avec `input.required`.
- Interpolation, événements, propriétés, `[class]`, `@if`, `@for`.
- Pipes `number`, `date` et pipe personnalisé `disponibilite`.
- `RouterLink`, `RouterLinkActive`, `RouterOutlet`, routes enfants et paramétrées.
- `HttpClient`, `Observable`, `subscribe`, `tap`, GET/POST/PUT/DELETE.
- Bootstrap pour la présentation.
- Signal Forms : `form`, `FormRoot`, `FormField`, `required`, `min`,
  `max`, `minLength`, `maxLength` et `pattern`.

Les formulaires suivent le cours 14 : `[formRoot]`, `[formField]`,
`touched()` et `errors()` sous chaque champ. Les modèles sont remis à zéro
avec `set()`. La confirmation du mot de passe est vérifiée avec un `if`
lors de la soumission. Les contrôles de prix fini et de date restent dans
la méthode d'enregistrement.

Le signal `attente` bloque les doubles envois pendant les requêtes HTTP.
Les services conservent la structure du cours 13 : HttpClient, Observable,
pipe, tap, puis subscribe dans le composant.

Angular est passé de 20 à 21.2 pour cette fonctionnalité.
Le cours écrit `@Service` ; Angular utilise `@Injectable`.

## Organisation

- `src/app/components` : menu et carte.
- `src/app/pages` : liste, détail, informations et administration.
- `src/app/models/modeles.ts` : les trois interfaces.
- `src/app/services/coque-service.ts` : opérations HTTP sur les coques.
- `src/app/services/compte-service.ts` : connexion et mot de passe.
- `src/app/pipes/disponibilite-pipe.ts` : libellé de disponibilité.
- `bd.json` : base unique, coques et administrateurs.
- `src/environments/environment.development.ts` : `production: false` et `apiUrl` pour `ng serve`.
- `src/environments/environment.ts` : `production: true` et `apiUrl` pour le build de production.

Comme dans le TP9, `apiUrl` vaut `http://localhost:3000` dans les deux fichiers.
Les services importent `environment.ts` ; la configuration `development` dans
`angular.json` le remplace par `environment.development.ts` lors de la compilation.
Ils appellent directement `/coques` et `/administrateurs` sur ce serveur.

JSON ne stocke pas directement les objets Date : les dates sont sérialisées,
puis reconverties avec `new Date` à la lecture.
Les identifiants des nouvelles coques sont générés par JSON Server : aucun
identifiant n'est saisi ni envoyé dans la requête d'ajout.
Les avis sont conservés lors de la modification d'une coque.

## Vérification

Compilation : `npm run build`.

Vérifications effectuées dans Chrome sur une copie temporaire de la base :
recherche séparée/combinée, mauvais et bon login, ajout avec identifiant généré,
prix invalide refusé, modification, sauvegarde après rechargement, commentaire,
note invalide refusée, changement de mot de passe, confirmation incohérente
refusée, ancien mot de passe incorrect, connexion avec le nouveau mot de passe,
annulation de suppression, suppression, coque introuvable et affichage mobile.

Pour refaire une démonstration manuelle :
1. Ouvrir le catalogue et combiner nom/disponibilité.
2. Se connecter dans Admin avec le compte ci-dessus.
3. Ajouter une coque, la modifier et vérifier les compteurs.
4. Ouvrir son détail, ajouter un commentaire, recharger.
5. Revenir dans Admin, changer le mot de passe, se reconnecter.
6. Supprimer la coque après confirmation.

## Limite du serveur pédagogique

JSON Server est le serveur de test demandé par le cours. Le compte et son mot de
passe sont dans le fichier JSON, et l'API n'a pas de protection serveur.
La connexion masque les opérations dans l'interface ; elle ne sécurise pas
l'API contre des appels directs. Ce projet est une démonstration scolaire,
pas une boutique de production. Utiliser uniquement des données fictives.

## GitHub et déploiement

Le code peut être versionné localement. La publication nécessite le dépôt GitHub
de destination et l'hébergement : aucun dépôt distant ni URL publique n'est
inventé dans ce projet.

Le build se trouve dans `dist/casezone/browser`. L'hébergement doit :
- servir ces fichiers et renvoyer `index.html` pour les routes Angular ;
- conserver `bd.json` sur un stockage persistant et accessible en écriture.

Avant un déploiement distant, remplacer `apiUrl` dans `src/environments/environment.ts`
par l'adresse de la vraie API, puis reconstruire l'application avec `npm run build`.
Un dépôt GitHub ou un hébergement statique seul ne fait pas fonctionner le serveur JSON.
Ces deux exigences restent à finaliser avec le dépôt et l'hébergement choisis.
