# JuriPredict AI

**Comprendre le droit haïtien, explorer les scénarios, vérifier les sources.**

JuriPredict AI est un prototype LegalTech de hackathon qui vise à rendre le droit haïtien plus accessible. L’utilisateur décrit une question ou une situation en langage naturel ; la plateforme a pour objectif de rechercher les textes pertinents et de présenter une analyse explicable, accompagnée de références vérifiables.

Le projet s’appuie sur une approche **RAG** (*Retrieval-Augmented Generation*) : les documents juridiques sont recherchés avant la génération de la réponse, afin de rattacher l’analyse aux sources disponibles. JuriPredict est un outil d’information et d’aide à la recherche, et non un substitut à un avocat, à un juge ou à une juridiction.

## Objectifs du MVP

- Permettre la recherche juridique et la description d’une situation en langage naturel.
- Repérer les faits et les éléments juridiquement pertinents.
- Retrouver les articles et passages pertinents dans un corpus haïtien limité.
- Présenter des qualifications et scénarios possibles, sans prétendre prédire avec certitude une décision.
- Expliquer les textes dans un langage accessible tout en laissant le texte original consultable.
- Associer les informations juridiques importantes à des sources vérifiables.
- Signaler les incertitudes, les informations manquantes et les limites de l’analyse.

### Corpus envisagé

Le corpus initial du MVP privilégie la **Constitution haïtienne** et le **Code pénal haïtien**. Le Code civil, le Code de procédure pénale et des lois sélectionnées pourront être ajoutés selon la disponibilité et la vérification des documents. Chaque texte doit être correctement extrait, structuré par article et associé à ses métadonnées et à sa source.

## Périmètre du dépôt

Ce dépôt contient le **frontend** de JuriPredict AI. Il est actuellement initialisé avec React et Vite ; le cahier des charges recommande également Tailwind CSS et Lucide Icons. L’API, la base juridique et le moteur RAG décrits dans le cahier des charges constituent l’architecture cible et ne sont pas déclarés comme implémentés ici.

### Architecture cible

```text
Interface web (React)
        │
        ▼
API (FastAPI)
        │
        ├── Recherche sémantique et moteur RAG
        ├── Corpus juridique (PostgreSQL / pgvector)
        └── Moteur d’IA
        │
        ▼
Analyse structurée avec articles et sources
```

Le pipeline RAG envisagé comprend l’ingestion et le nettoyage des textes, leur découpage en unités cohérentes (notamment par article), la création d’embeddings, la recherche des passages pertinents, puis la génération d’une analyse structurée à partir de ces sources.

## Technologies

**Présentes dans ce frontend :**

- React 19
- Vite
- Tailwind CSS
- React Router
- Lucide React

**Prévues pour l’architecture complète :**

- Backend : Python, FastAPI et Pydantic
- Données juridiques : PostgreSQL et pgvector
- Recherche et génération : embeddings, retrieval et LLM dans un pipeline RAG

## Démarrage

### Prérequis

- Node.js et npm

### Installation et lancement

```bash
npm install
npm run dev
```

Vite affiche dans le terminal l’adresse locale à ouvrir dans le navigateur.

### Commandes disponibles

| Commande | Description |
| --- | --- |
| `npm run dev` | Lance le serveur de développement. |
| `npm run build` | Génère la version de production dans `dist/`. |
| `npm run preview` | Sert localement la version de production générée. |
| `npm run lint` | Vérifie le code avec Oxlint. |

## Principes de fiabilité et de responsabilité

- **Traçabilité :** relier les affirmations juridiques aux textes utilisés et permettre de consulter les sources.
- **Distinction des contenus :** différencier le texte juridique original de l’explication générée par l’IA.
- **Prudence :** présenter des qualifications comme possibles, exposer les incertitudes et demander des précisions lorsque les faits sont insuffisants.
- **Réduction des hallucinations :** ancrer les réponses dans les documents récupérés et signaler lorsqu’ils ne permettent pas de répondre suffisamment.
- **Protection des données :** éviter de demander ou conserver les données personnelles qui ne sont pas nécessaires ; anonymiser les situations lorsque cela est possible.
- **Sécurité :** prévoir la validation des entrées, la protection des clés API, le contrôle des accès et la limitation du débit dans l’application complète.

> **Avertissement juridique :** JuriPredict est un outil d’information et d’analyse juridique assisté par intelligence artificielle. Les résultats peuvent contenir des erreurs ou être incomplets. Ils ne constituent pas un avis juridique professionnel et ne remplacent pas les conseils d’un avocat ou la décision d’une juridiction compétente.

## Équipe

**BRUTEFORCE**

- **Desulma Jhonsley** — Développeur frontend
- **Ralph Meus** — Ingénieur IA et données
- **Gassendy John Rene** — Développeur backend

## Statut

Projet de hackathon — prototype/MVP. Le périmètre et les technologies présentés comme « prévus » décrivent les objectifs du cahier des charges ; ils ne signifient pas que les fonctionnalités correspondantes sont déjà disponibles dans ce dépôt.
