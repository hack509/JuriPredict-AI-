import { useEffect, useState } from 'react'
import { BookOpen, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import ArticleItem from '../components/search/ArticleItem.jsx'
import { searchArticles } from '../services/api.js'

const DOCUMENT_OPTIONS = [
  'Constitution',
  'Code pénal',
  'Code civil',
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [draft, setDraft] = useState({ query, value: query })
  const searchInput = draft.query === query ? draft.value : query
  const [documentFilter, setDocumentFilter] = useState('Tous les documents')

  function handleSubmit(event) {
    event.preventDefault()
    const nextQuery = searchInput.trim()
    setSearchParams(nextQuery ? { q: nextQuery } : {})
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">
          Corpus juridique
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy">
          Base juridique
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          Recherchez un mot-clé pour parcourir les textes disponibles et
          consulter les références originales.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
        role="search"
      >
        <label className="sr-only" htmlFor="article-search">
          Rechercher dans les articles
        </label>
        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="article-search"
            type="search"
            value={searchInput}
            onChange={(event) =>
              setDraft({ query, value: event.target.value })
            }
            placeholder="Ex. : vol, propriété, contrat…"
            className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600"
        >
          Rechercher
        </button>
      </form>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label
          htmlFor="document-filter"
          className="text-sm font-medium text-slate-700"
        >
          Filtrer par document
        </label>
        <select
          id="document-filter"
          value={documentFilter}
          onChange={(event) => setDocumentFilter(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option>Tous les documents</option>
          {DOCUMENT_OPTIONS.map((document) => (
            <option key={document}>{document}</option>
          ))}
        </select>
      </div>

      {!query.trim() && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <BookOpen className="mx-auto text-info" size={28} aria-hidden="true" />
          <h2 className="mt-3 font-semibold text-navy">
            Explorez les textes disponibles
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Saisissez un mot-clé, puis validez avec Entrée ou le bouton de
            recherche.
          </p>
        </div>
      )}
      {query.trim() && (
        <SearchResults
          key={query}
          query={query}
          documentFilter={documentFilter}
        />
      )}
    </div>
  )
}

function SearchResults({ query, documentFilter }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(Boolean(query.trim()))
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    searchArticles(query)
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error('La réponse de recherche est dans un format inattendu.')
        }
        if (active) setArticles(data)
      })
      .catch((requestError) => {
        if (active) {
          setArticles([])
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'La recherche a échoué. Réessayez.',
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [attempt, query])

  const filteredArticles =
    documentFilter === 'Tous les documents'
      ? articles
      : articles.filter((article) =>
          (article.document ?? article.document_title)
            ?.toLocaleLowerCase()
            .includes(documentFilter.toLocaleLowerCase()),
        )

  if (loading) {
    return (
      <p role="status" className="rounded-xl bg-white p-5 text-sm text-slate-600">
        Recherche des textes en cours…
      </p>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p role="alert">{error}</p>
        <button
          type="button"
          onClick={() => {
            setError('')
            setLoading(true)
            setAttempt((current) => current + 1)
          }}
          className="mt-3 font-semibold underline"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (filteredArticles.length === 0) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
        Aucun article trouvé dans le corpus disponible.
      </p>
    )
  }

  return (
    <section aria-label="Résultats de recherche" className="space-y-3">
      <p className="text-sm text-slate-500">
        {filteredArticles.length}{' '}
        {filteredArticles.length === 1 ? 'résultat' : 'résultats'} pour « {query} »
      </p>
      {filteredArticles.map((article) => (
        <ArticleItem key={article.id} article={article} />
      ))}
    </section>
  )
}