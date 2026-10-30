import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Sparkles } from 'lucide-react'
import QualificationCard from '../components/analysis/QualificationCard.jsx'
import ScenarioTabs from '../components/analysis/ScenarioTabs.jsx'
import LegalDisclaimer from '../components/layout/LegalDisclaimer.jsx'
import { useAnalysis } from '../context/useAnalysis.js'
import { analyzeCase } from '../services/api.js'

function AiBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-info/30 bg-info/10 px-2.5 py-1 text-xs font-medium text-navy">
      <Sparkles size={13} aria-hidden="true" />
      Généré par l&apos;IA
    </span>
  )
}

export default function ResultPage() {
  const { facts, setFacts, result, setResult } = useAnalysis()
  const [newFact, setNewFact] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!result) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-navy">Aucune analyse en cours</h1>
        <p className="mt-2 text-sm text-slate-600">
          Décrivez une situation pour consulter les pistes juridiques.
        </p>
        <Link
          to="/assistant"
          className="mt-5 inline-flex rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600"
        >
          Commencer une analyse
        </Link>
      </section>
    )
  }

  async function addFact(event) {
    event.preventDefault()
    const updatedFacts = `${facts} ${newFact}`.trim()
    if (!newFact.trim() || loading) return

    setLoading(true)
    setError('')
    try {
      const updatedResult = await analyzeCase(updatedFacts)
      setFacts(updatedFacts)
      setResult(updatedResult)
      setNewFact('')
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "La réanalyse a échoué. Réessayez.",
      )
    } finally {
      setLoading(false)
    }
  }

  const qualifications = result.possible_qualifications ?? []
  const scenarios = result.scenarios ?? []
  const limitations = result.limitations ?? []
  const clarificationQuestions = result.clarification_questions ?? []

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">
          Étape 2 · Comprendre et vérifier
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy">
          Résultat de l&apos;analyse
        </h1>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-navy">Faits fournis</h2>
          <span className="text-xs text-slate-500">Votre description</span>
        </div>
        <p className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {facts}
        </p>
        <form onSubmit={addFact} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="new-fact">
            Ajouter un fait
          </label>
          <input
            id="new-fact"
            value={newFact}
            onChange={(event) => setNewFact(event.target.value)}
            placeholder="Ajouter un fait (ex. : la personne aurait utilisé la violence)"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={!newFact.trim() || loading}
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Réanalyse…' : 'Ajouter et réanalyser'}
          </button>
        </form>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </section>

      <section className="space-y-4" aria-labelledby="analysis-heading">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="analysis-heading" className="text-xl font-semibold text-navy">
            Analyse IA
          </h2>
          <AiBadge />
        </div>
        <p className="rounded-xl border border-info/20 bg-info/5 p-4 text-sm leading-6 text-slate-700">
          {result.case_summary}
        </p>
        {qualifications.length > 0 ? (
          <>
            <h3 className="pt-1 text-sm font-semibold uppercase tracking-wide text-slate-600">
              Qualifications possibles
            </h3>
            {qualifications.map((qualification, index) => (
              <QualificationCard
                key={`${qualification.name}-${index}`}
                qualification={qualification}
                index={index}
              />
            ))}
          </>
        ) : (
          <p className="flex gap-2 rounded-xl border border-warn/30 bg-amber-50 p-4 text-sm leading-6 text-slate-700">
            <AlertCircle className="mt-1 shrink-0 text-warn" size={17} aria-hidden="true" />
            Les documents disponibles ne permettent pas d&apos;établir cette
            information avec suffisamment de certitude.
          </p>
        )}
      </section>

      {clarificationQuestions.length > 0 && (
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="font-semibold text-navy">Précisions utiles</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {clarificationQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold text-navy">Scénarios possibles</h2>
          <AiBadge />
        </div>
        {scenarios.length > 0 ? (
          <ScenarioTabs scenarios={scenarios} />
        ) : (
          <p className="rounded-xl bg-white p-4 text-sm text-slate-600">
            Aucun scénario n&apos;est disponible pour cette analyse.
          </p>
        )}
      </section>

      {limitations.length > 0 && (
        <section className="rounded-xl border border-warn/30 bg-amber-50 p-5 text-sm">
          <h2 className="font-semibold text-navy">Limites de l&apos;analyse</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 leading-6 text-slate-700">
            {limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </section>
      )}

      <LegalDisclaimer />
    </div>
  )
}