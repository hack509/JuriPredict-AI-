import { useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, BookOpen, Copy, ExternalLink } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import LegalDisclaimer from '../components/layout/LegalDisclaimer.jsx'
import { explainText, getArticle } from '../services/api.js'

export default function ArticlePage() {
  const { id } = useParams()
  const [articleState, setArticleState] = useState({
    id,
    article: null,
    loading: true,
    error: '',
  })
  const [explanationState, setExplanationState] = useState({ id, value: '' })
  const [explainErrorState, setExplainErrorState] = useState({ id, value: '' })
  const [explainingId, setExplainingId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const article = articleState.id === id ? articleState.article : null
  const loading = articleState.id !== id || articleState.loading
  const error = articleState.id === id ? articleState.error : ''
  const explanation =
    explanationState.id === id ? explanationState.value : ''
  const explainError =
    explainErrorState.id === id ? explainErrorState.value : ''
  const explaining = explainingId === id
  const copied = copiedId === id

  useEffect(() => {
    let active = true

    getArticle(id)
      .then((data) => {
        if (active) {
          setArticleState({
            id,
            article: data,
            loading: false,
            error: data
              ? ''
              : 'Cet article est introuvable dans le corpus disponible.',
          })
        }
      })
      .catch((requestError) => {
        if (active) {
          setArticleState({
            id,
            article: null,
            loading: false,
            error:
              requestError instanceof Error
                ? requestError.message
                : "Impossible de charger l'article.",
          })
        }
      })

    return () => {
      active = false
    }
  }, [id])

  async function handleExplain() {
    if (!article || explaining) return
    setExplainingId(id)
    setExplainErrorState({ id, value: '' })
    try {
      const response = await explainText(article.content)
      setExplanationState({ id, value: response.explanation })
    } catch (requestError) {
      setExplainErrorState({
        id,
        value:
          requestError instanceof Error
            ? requestError.message
            : "L'explication n'a pas pu être générée.",
      })
    } finally {
      setExplainingId(null)
    }
  }

  async function handleCopyReference() {
    if (!article) return
    try {
      await navigator.clipboard.writeText(
        `${article.document_title}, article ${article.article_number} — ${article.title}`,
      )
      setCopiedId(id)
      window.setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setExplainErrorState({
        id,
        value: 'La référence ne peut pas être copiée depuis ce navigateur.',
      })
    }
  }

  if (loading) {
    return (
      <p role="status" className="mx-auto max-w-3xl rounded-xl bg-white p-5 text-sm text-slate-600">
        Chargement de l&apos;article…
      </p>
    )
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error || 'Article introuvable.'}
        </p>
        <Link to="/base-juridique" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à la base juridique
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link to="/base-juridique" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
        <ArrowLeft size={16} aria-hidden="true" />
        Retour à la base juridique
      </Link>

      <article className="space-y-5">
        <header className="rounded-2xl bg-navy p-6 text-white sm:p-8">
          <p className="flex items-center gap-2 text-sm text-slate-200">
            <BookOpen size={16} aria-hidden="true" />
            {article.document_title}
            {article.chapter ? ` · ${article.chapter}` : ''}
          </p>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
            Article {article.article_number} — {article.title}
          </h1>
        </header>

        <section
          aria-labelledby="official-text-heading"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <h2
            id="official-text-heading"
            className="text-sm font-semibold uppercase tracking-wide text-slate-500"
          >
            Texte officiel
          </h2>
          <blockquote className="mt-4 border-l-4 border-navy pl-4 font-serif leading-7 text-slate-800">
            {article.content}
          </blockquote>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleExplain}
            disabled={explaining}
            className="rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {explaining ? 'Explication en cours…' : 'Expliquer simplement'}
          </button>
          {article.file_url && article.file_url !== '#' ? (
            <a
              href={article.file_url}
              download
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Télécharger le document source
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          ) : (
            <span className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-500">
              Document source non disponible dans cette démo
            </span>
          )}
          <button
            type="button"
            onClick={handleCopyReference}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Copy size={15} aria-hidden="true" />
            {copied ? 'Référence copiée' : 'Copier la référence'}
          </button>
        </div>

        {explainError && (
          <p role="alert" className="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle size={17} className="shrink-0" aria-hidden="true" />
            {explainError}
          </p>
        )}

        {explanation && (
          <section className="rounded-2xl border border-info/20 bg-info/5 p-5 sm:p-6">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Explication générée par l&apos;IA
            </span>
            <p className="mt-2 text-sm leading-6 text-slate-700">{explanation}</p>
          </section>
        )}
      </article>

      <LegalDisclaimer />
    </div>
  )
}