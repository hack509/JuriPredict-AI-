import { ArrowUpRight, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

const relevanceLabels = {
  high: 'Pertinence élevée',
  medium: 'Pertinence moyenne',
  low: 'Pertinence faible',
}

export default function ArticleItem({ article }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand/30 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <FileText size={14} aria-hidden="true" />
            {article.document ?? article.document_title}
            {article.chapter ? ` · ${article.chapter}` : ''}
          </p>
          <h2 className="mt-2 font-semibold text-navy">
            Article {article.article_number} — {article.title}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
            {article.content}
          </p>
        </div>
        <span className="w-fit shrink-0 rounded-full bg-info/10 px-3 py-1 text-xs font-medium text-navy">
          {relevanceLabels[article.relevance] ?? 'Source à consulter'}
        </span>
      </div>
      <Link
        to={`/base-juridique/${encodeURIComponent(article.id)}`}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
      >
        Consulter la source
        <ArrowUpRight size={15} aria-hidden="true" />
      </Link>
    </article>
  )
}
