# Guide d’integration Backend et RAG — JuriPredict

Ce guide est destine aux developpeurs frontend, backend et IA/donnees. Il decrit les points de branchement du frontend, les contrats attendus et les etapes proposees pour rendre l’assistant operationnel. Il ne signifie pas que l’API, le stockage, le corpus ou le moteur RAG sont deja deployes.

## 1. Etat actuel et perimetre

Le depot present est le frontend React/Vite. Il contient des pages de recherche, de consultation d’articles, d’analyse de situation et un assistant conversationnel. Les services appellent une API HTTP, mais le serveur attendu n’est pas inclus dans ce depot.

| Capacite | Etat dans le frontend |
| --- | --- |
| Assistant `/assistant` | Interface et gestion locale des conversations. Les messages sont envoyes a `POST /api/v1/chat`. Sans backend disponible, une erreur explicite est montree ; aucune reponse IA n’est inventee. |
| Sources de l’assistant | Les citations recues du backend sont affichees. Le frontend ne verifie pas leur authenticite. |
| Pieces jointes du chat | Selection et apercu local. Avec un backend, le navigateur envoie les fichiers en `multipart/form-data`; leur extraction et analyse sont a implementer cote serveur. |
| Analyse `/resultat` | Service `analyzeCase`; des donnees de demonstration sont utilisees par defaut. |
| Recherche `/base-juridique` | Service `searchArticles`; des articles de demonstration existent, avec des references marquees `XXX`. |
| Detail `/base-juridique/:id` | Attend un objet article, puis peut demander une explication via `explainText`. |
| Persistance des conversations | `localStorage` du navigateur, sans synchronisation de compte ni stockage serveur. |
| Streaming, authentification, base de donnees et RAG | Non implementes dans ce depot. |

Les appels existants sont dans [src/services/api.js](./src/services/api.js) et le chat est dans [src/services/chat.js](./src/services/chat.js). Les donnees de demonstration sont dans [src/services/mocks.js](./src/services/mocks.js). Ne pas utiliser les references `XXX` comme sources juridiques.

## 2. Vue cible

```text
React/Vite
  ├── POST /api/v1/chat ----------------------┐
  ├── POST /api/v1/analyze                    │
  ├── POST /api/v1/search                     ├── API backend
  ├── GET  /api/v1/articles/{id}              │     ├── Authentification et autorisation
  └── POST /api/v1/explain -------------------┘     ├── Conversations et documents
                                                       ├── Recherche lexicale + vectorielle
Corpus officiel -> ingestion -> articles/sections -> chunks -> embeddings
                                                       └── RAG -> LLM -> reponse structuree + sources
```

Le frontend est prepare a consommer des services HTTP JSON et le point d’entree du chat supporte deja un envoi JSON ou multipart. Le contrat exact, l’authentification, les identifiants persistants, le streaming, le magasin de conversations, l’ingestion et la recuperation RAG restent a definir et a implementer cote serveur.

## 3. Configuration locale

Creer un fichier `.env.local` a la racine du frontend :

```dotenv
VITE_API_URL=http://localhost:8000
VITE_USE_MOCKS=false
```

- `VITE_API_URL` est lu par les deux services frontend. Utiliser l’URL HTTPS du backend dans les environnements partages et de production.
- `VITE_USE_MOCKS` ne controle que les fonctions de `src/services/api.js` (analyse, recherche, articles et explication). `false` desactive ces donnees de demonstration.
- Le chat appelle le backend directement et n’utilise pas `VITE_USE_MOCKS`.
- Les variables `VITE_*` sont integrees au bundle navigateur : n’y mettre aucun secret, cle de modele ou identifiant prive.
- Configurer CORS cote serveur pour autoriser l’origine du frontend en developpement et en production.

Lancer et valider le frontend :

```bash
npm install
npm run dev
npm run lint
npm run build
```

## 4. Contrats API consommes actuellement

Tous les endpoints ci-dessous utilisent le prefixe `VITE_API_URL` et `/api/v1`. Les exemples de reponse sont des schemas minimaux compatibles avec les consommateurs actuels. Le backend peut ajouter des champs, mais doit conserver ceux dont depend l’interface.

### 4.1 `POST /api/v1/chat`

Sans fichier, le frontend envoie :

```json
{
  "conversation_id": "uuid-genere-par-le-client",
  "message": "Question juridique de l’utilisateur",
  "mode": "chat",
  "profile": "standard"
}
```

`mode` vaut actuellement `chat`, `research` ou `document`. `profile` vaut `standard`, `research`, `document` ou `reasoning`. Ce sont des preferences d’interface, pas une promesse qu’un modele specifique est configure.

Avec un ou plusieurs fichiers, la requete est `multipart/form-data` avec les champs texte `conversation_id`, `message`, `mode`, `profile` et un champ `files` repete pour chaque fichier. Le navigateur doit choisir lui-meme la frontiere multipart ; ne pas forcer `Content-Type` manuellement.

Reponse minimale :

```json
{
  "id": "message-backend-123",
  "content": "Reponse redigee par le service.",
  "citations": [
    {
      "id": "source-456",
      "document_title": "Titre exact du texte",
      "article_number": "numero exact provenant du corpus",
      "title": "Titre de l’article",
      "excerpt": "Passage retrouve dans le document source.",
      "url": "https://url-officielle-ou-page-interne",
      "verified": true
    }
  ]
}
```

Le frontend accepte aussi `message_id` au lieu de `id`, ou un contenu dans `message.content`. `citations` doit etre un tableau ; chaque citation doit reposer sur un passage retrouve et identifiable. N’envoyer `verified: true` que si le processus de validation des sources le justifie. Si aucune source n’est trouvee, renvoyer un tableau vide et exprimer les limites dans le contenu, plutot que de fabriquer un article.

Codes HTTP recommandes : `400` entree invalide, `401/403` session absente/non autorisee, `413` fichier trop volumineux, `422` format invalide, `429` limite de debit, `5xx` erreur de service. La reponse d’erreur peut suivre le format :

```json
{ "detail": "Explication non sensible de l’erreur." }
```

Le frontend signale actuellement le code HTTP et ne lit pas encore `detail` ; une amelioration du service client pourra afficher le detail normalise. Le streaming SSE/WebSocket n’est pas encore gere : commencer avec une reponse JSON complete, ou faire evoluer le client et documenter le protocole avant d’activer le streaming.

### 4.2 `POST /api/v1/analyze`

Utilise par l’analyse de situation et la page de resultat :

```json
{ "query": "Description des faits" }
```

Reponse attendue, calquee sur `mockAnalysis` et les composants de resultat :

```json
{
  "case_summary": "Resume prudent des faits fournis.",
  "possible_qualifications": [
    {
      "name": "Qualification envisageable",
      "relevance": "medium",
      "sources": [
        {
          "document": "Code penal haitien",
          "article": "numero exact",
          "article_id": "identifiant-stable-article"
        }
      ]
    }
  ],
  "scenarios": [
    { "title": "Scenario A", "description": "Analyse conditionnelle." }
  ],
  "limitations": ["Limite ou fait manquant."],
  "clarification_questions": ["Question de clarification."]
}
```

Les valeurs de pertinence reconnues par l’interface sont `high`, `medium` et `low`. Toute source doit pointer vers un identifiant retourne par le corpus et consultable par `GET /api/v1/articles/{id}`. Le resultat est une analyse assistee, pas une prediction certaine de jugement.

### 4.3 `POST /api/v1/search`

Requete :

```json
{ "query": "terme ou expression" }
```

Reponse : tableau JSON d’articles :

```json
[
  {
    "id": "article-123",
    "document_title": "Constitution haitienne",
    "document": "Constitution",
    "article_number": "numero exact",
    "title": "Titre",
    "chapter": "Chapitre",
    "content": "Texte du passage juridiquement source.",
    "file_url": "https://source-officielle",
    "relevance": "high"
  }
]
```

Le frontend applique actuellement le filtre par type de document dans le navigateur. Les prochains travaux peuvent deplacer ce filtre et la pagination vers l’API avec un contrat versionne.

### 4.4 `GET /api/v1/articles/{id}` et `POST /api/v1/explain`

Le detail d’article utilise l’identifiant stable retourne par la recherche ou l’analyse. Il doit retourner les champs article de la reponse de recherche. L’explication envoie :

```json
{ "text": "Texte de l’article a expliquer" }
```

Reponse minimale :

```json
{ "explanation": "Explication clairement distinguee du texte original." }
```

Garder le texte officiel et l’explication generee visuellement distincts. L’explication ne doit pas modifier la source ni ajouter de citations sans provenance.

## 5. Travaux Backend/API

1. **Formaliser le contrat** : publier un schema OpenAPI commun, les DTO/Pydantic schemas, les codes d’erreur, les limites de requete et les versions.
2. **Configurer l’application** : URL et port, CORS par origine autorisee, logs sans donnees personnelles inutiles, timeouts, limitation de debit et gestion uniforme des erreurs.
3. **Implementer les endpoints** : chat, analyse, recherche, lecture d’article et explication, avec validation stricte des entrees.
4. **Ajouter auth si necessaire** : sessions ou jetons securises, autorisation par utilisateur et isolation stricte des conversations. Ne jamais faire confiance a un `conversation_id` fourni par le client sans verifier les droits.
5. **Persister** : utilisateurs, conversations, messages, documents, versions de textes, articles/sections, chunks, metadonnees de provenance, embeddings, citations et retours utilisateur. Fixer la politique de retention et de suppression.
6. **Remplacer le stockage local** : introduire un service frontend de conversations pour lister, charger, creer, renommer, archiver et supprimer cote API. Garder `localStorage` comme mode invite/de secours seulement si le produit le souhaite.
7. **Tester les contrats** : tests de schema, cas sans source, source introuvable, requete invalide, absence de session, gros fichiers, timeout et erreurs du fournisseur LLM.

Le frontend ne transmet actuellement aucun jeton d’authentification a `chat.js`. Avant activation d’un backend authentifie, convenir du mecanisme (cookie `HttpOnly` prefere si architecture adaptee, ou bearer token gere sans stockage vulnerable), du renouvellement et du logout, puis centraliser ces en-tetes dans un client HTTP partage plutot que d’ajouter des tokens dans chaque page.

## 6. Travaux Corpus/RAG

1. **Choisir les sources** : Constitution et Code penal en priorite MVP ; documenter pour chaque texte l’editeur/source officielle, la date, la langue, la juridiction, le statut et les droits de reutilisation.
2. **Valider les fichiers** : conserver l’original, enregistrer son empreinte et sa provenance, detecter scans/OCR, encoder correctement le francais et le kreyol, et faire verifier les extractions par une personne.
3. **Structurer** : extraire les textes en documents, chapitres, articles et paragraphes. Garder des identifiants stables et les liens entre articles, version du texte, page et fichier source.
4. **Versionner et dedupliquer** : distinguer editions/amendements, dates d’effet et doublons ; ne jamais ecraser silencieusement une version juridique anterieure.
5. **Chunker** : privilegier les limites juridiques (article/paragraphes), eviter de melanger plusieurs articles dans un passage, conserver le contexte du chapitre lorsque necessaire et stocker les offsets/pages.
6. **Indexer** : creer les embeddings avec modele et version enregistres ; combiner recherche semantique et lexicale pour les numeros d’articles, noms de textes et termes precis. Filtrer par juridiction, document, langue, version et statut.
7. **Recuperer et generer** : fournir au generateur uniquement les passages recuperes, leurs metadonnees et identifiants. Demander une reponse structuree avec citations liees aux IDs recuperes, incertitudes, limites et questions de clarification.
8. **Valider les citations** : verifier cote serveur que chaque citation retournee correspond a un passage recupere ; conserver les scores et les versions a des fins d’evaluation, sans les presenter comme une certitude juridique.
9. **Evaluer** : constituer un jeu de questions et de reponses de reference revu par des personnes qualifiees ; mesurer rappel des sources, precision des citations, pertinence, abstention quand le corpus est insuffisant, latence et regressions.
10. **Surveiller** : suivre erreurs, latences, couts et taux de non-reponse sans journaliser les faits confidentiels par defaut. Prevoir reindexation reproductible et retour a une version de corpus connue.

Le backend doit refuser ou nuancer une reponse lorsque les sources sont absentes ou insuffisantes. Le RAG reduit certains risques d’hallucination, mais ne garantit ni l’exactitude ni un avis juridique professionnel.

## 7. Traitement des documents

Le chat accepte actuellement les extensions PDF, DOCX, TXT, MD et images jusqu’a 20 Mo, mais le fichier n’est pas traite par le frontend. Pour les activer :

- definir limites configurees cote serveur (taille, nombre, types MIME et formats reellement detectes) ;
- analyser les fichiers dans un environnement controle, extraire le texte/OCR et retourner erreurs de traitement et pages concernees ;
- stocker les fichiers de maniere privee, autorisee, chiffree si necessaire, avec politique de retention et suppression ;
- proteger contre les fichiers malveillants, archives et contenus actifs ; ne pas exposer de lien public par defaut ;
- associer l’extraction aux messages et citations tout en signalant le contenu utilisateur comme non verifie ;
- mettre a jour l’interface pour afficher le statut d’upload, extraction, echec et suppression depuis le serveur.

Le chat envoie chaque fichier via `files`. Ne pas s’attendre a ce qu’un fichier soit present dans l’historique API apres rechargement : le frontend ne persiste actuellement que son nom, sa taille et son type.

## 8. Ordre d’integration recommande

1. Le backend publie OpenAPI et une API locale avec fixtures juridiques verifiees.
2. Le frontend desactive les mocks (`VITE_USE_MOCKS=false`) et valide recherche, article, explication et analyse.
3. Le backend branche le corpus structure, puis la recherche lexicale/vectorielle et le RAG ; les citations sont verifiees et renvoient a un article consultable.
4. Brancher `POST /api/v1/chat` en JSON, tester les erreurs et l’abstention, puis connecter le stockage des conversations.
5. Implementer l’authentification et les permissions, puis tester l’isolation des donnees entre utilisateurs.
6. Ajouter les uploads et leur pipeline securise uniquement apres accord sur le format multipart et le cycle de vie des documents.
7. Ajouter le streaming, le partage public ou les notifications seulement avec des contrats et controles d’acces dedies.
8. Executer `npm run lint`, `npm run build`, les tests API et les tests E2E des parcours principaux avant de deployer.

## 9. Definition de termine

- Tous les textes et numeros d’articles sont issus du corpus verifie, jamais des donnees de demonstration.
- Une citation est ouvrable, identifie son document/version/article et correspond a un passage effectivement retrouve.
- La reponse indique ses limites et peut s’abstenir si les sources sont insuffisantes.
- Les fichiers, conversations et citations sont controles par les permissions et les politiques de retention.
- Les erreurs serveur ne sont pas converties en reponses juridiques fictives.
- Les contrats sont testes de bout en bout avec versions de schemas partagees entre frontend et backend.
