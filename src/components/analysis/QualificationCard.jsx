import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const relevanceLabels = {
  high: 'Pertinence élevée',
  medium: 'Pertinence moyenne',
  low: 'Pertinence faible',
}

export default function QualificationCard({ qualification, index }) {
  const { name, relevance, sources = [] } = qualification

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Qualification potentielle {index + 1}
          </p>
          <h3 className="mt-1 font-semibold text-navy">{name}</h3>
        </div>
        <span className="w-fit rounded-full bg-info/10 px-3 py-1 text-xs font-medium text-navy">
          {relevanceLabels[relevance] ?? 'Pertinence à vérifier'}
        </span>
      </div>
      {sources.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {sources.map((source) => (
            <li key={`${source.document}-${source.article}-${source.article_id}`}>
              <Link
                to={`/base-juridique/${encodeURIComponent(source.article_id)}`}
                className="inline-flex items-center gap-1 rounded-lg border border-brand/20 bg-blue-50 px-3 py-2 text-sm font-medium text-brand hover:bg-blue-100"
              >
                {source.document}, article {source.article}
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Aucune source n&apos;est associée à cette qualification.
        </p>
      )}
    </article>
  )
}
