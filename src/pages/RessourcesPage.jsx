import { useState } from 'react'
import {
  ArrowUpRight,
  BookOpenCheck,
  CircleHelp,
  FileCheck2,
  Globe2,
  Landmark,
  LibraryBig,
  Scale,
  ShieldAlert,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import LegalDisclaimer from '../components/layout/LegalDisclaimer.jsx'
import { legalResources } from '../data/legalResources.js'

const questions = [
  {
    question: 'JuriPredict remplace-t-il un avocat ?',
    answer:
      'Non. JuriPredict est un prototype d’information et d’aide à la recherche. Son analyse peut être incomplète ou erronée et ne constitue pas un avis juridique professionnel.',
  },
  {
    question: 'Comment vérifier une analyse ?',
    answer:
      'Consultez les liens vers les articles associés aux qualifications. Comparez toujours les explications au texte juridique original et demandez conseil à un professionnel.',
  },
  {
    question: 'Quels textes sont couverts ?',
    answer:
      'Le corpus envisagé comprend la Constitution haïtienne et les Codes pénal et civil. La disponibilité des textes peut varier ; une référence de démonstration n’est pas une source vérifiée.',
  },
]
const resourceIcons = {
  'Archives juridiques': LibraryBig,
  'Bibliothèque numérique': LibraryBig,
  'Documentation publique': LibraryBig,
  'Droit du travail': Scale,
  'Droits humains et protection': ShieldAlert,
  'Droits humains interaméricains': ShieldAlert,
  'Droit de l’environnement': FileCheck2,
  'Foncier et territoire': Landmark,
  'Finances et fiscalité': Scale,
  'Guide de recherche': BookOpenCheck,
  'Jurisprudence institutionnelle': Scale,
  'Jurisprudence internationale': Scale,
  'Jurisprudence francophone': Scale,
  'Journal officiel': Landmark,
  'Marchés publics': FileCheck2,
  'Normes internationales du travail': Scale,
  'Propriété intellectuelle': FileCheck2,
  'Recherche juridique': BookOpenCheck,
  'Agriculture et ressources naturelles': Globe2,
  'Construction et infrastructures': Landmark,
  'Commerce et industrie': Landmark,
  'Droit public et finances': Scale,
  'Traités internationaux': Globe2,
}

export default function RessourcesPage() {
  const [selectedScope, setSelectedScope] = useState('all')
  const visibleResources = legalResources.filter(
    ({ scope }) => selectedScope === 'all' || scope === selectedScope,
  )

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <header className="relative overflow-hidden rounded-3xl bg-navy px-6 py-10 text-white sm:px-10 sm:py-14">
        <div
          className="absolute -right-20 -top-24 size-72 rounded-full border-[32px] border-white/5"
          aria-hidden="true"
        />
        <div className="relative max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-info">
            Guides et références
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Sources juridiques nationales et internationales
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-slate-200">
            Retrouvez des publications officielles, des archives juridiques et
            des ressources documentaires pour approfondir vos recherches.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-slate-100">
            <FileCheck2 size={15} aria-hidden="true" />
            Vérifiez toujours la version officielle et la date du texte.
          </p>
        </div>
      </header>

      <section aria-labelledby="official-resources-heading">
        <div className="mb-6 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            Références externes
          </p>
          <h2
            id="official-resources-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-navy"
          >
            Publications et bases juridiques
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Explorez la législation et la jurisprudence haïtiennes, ainsi que
            des bases internationales spécialisées. Les ressources sont des
            points de départ : vérifiez toujours les textes et leur portée.
          </p>
        </div>
        <div
          className="mb-6 flex flex-wrap gap-2"
          role="group"
          aria-label="Filtrer les ressources juridiques"
        >
          {[
            { value: 'all', label: `Toutes (${legalResources.length})` },
            {
              value: 'national',
              label: `Droit national (${legalResources.filter(({ scope }) => scope === 'national').length})`,
            },
            {
              value: 'international',
              label: `Droit international (${legalResources.filter(({ scope }) => scope === 'international').length})`,
            },
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={selectedScope === value}
              onClick={() => setSelectedScope(value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                selectedScope === value
                  ? 'border-navy bg-navy text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-brand/40 hover:text-brand'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleResources.map((resource) => {
            const Icon = resourceIcons[resource.category] ?? BookOpenCheck

            return (
              <article
                key={resource.name}
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-lg hover:shadow-navy/5 sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-brand transition group-hover:bg-brand group-hover:text-white">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {resource.category}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        resource.scope === 'national'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {resource.scope === 'national' ? 'Haïti' : 'International'}
                    </span>
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-navy">
                  {resource.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                  {resource.description}
                </p>
                {resource.note && (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                    {resource.note}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition hover:text-blue-700"
                  >
                    {resource.linkLabel}
                    <ArrowUpRight size={16} aria-hidden="true" />
                    <span className="sr-only">(ouvre un nouvel onglet)</span>
                  </a>
                  {resource.secondaryUrl && (
                    <a
                      href={resource.secondaryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-brand"
                    >
                      {resource.secondaryLinkLabel}
                      <ArrowUpRight size={15} aria-hidden="true" />
                      <span className="sr-only">(ouvre un nouvel onglet)</span>
                    </a>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="using-juripredict-heading">
        <h2
          id="using-juripredict-heading"
          className="mb-5 text-2xl font-bold tracking-tight text-navy"
        >
          Bien utiliser JuriPredict
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <BookOpenCheck className="text-info" size={24} aria-hidden="true" />
            <h2 className="mt-4 font-semibold text-navy">Vérifiez les sources</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Les qualifications sont des pistes à examiner, pas des conclusions.
              Ouvrez l&apos;article associé et distinguez toujours le texte officiel
              de son explication.
            </p>
            <Link
              to="/base-juridique"
              className="mt-4 inline-flex text-sm font-semibold text-brand hover:underline"
            >
              Parcourir la base juridique
            </Link>
          </article>
          <article className="rounded-2xl border border-warn/30 bg-amber-50 p-6">
            <ShieldAlert className="text-warn" size={24} aria-hidden="true" />
            <h2 className="mt-4 font-semibold text-navy">Protégez vos données</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              N&apos;incluez pas de noms, de numéros de téléphone ou d&apos;adresses
              dans la description de votre situation. Utilisez des faits
              anonymisés.
            </p>
          </article>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="space-y-3">
        <div className="flex items-center gap-2">
          <CircleHelp className="text-info" size={20} aria-hidden="true" />
          <h2 id="faq-heading" className="text-xl font-semibold text-navy">
            Questions fréquentes
          </h2>
        </div>
        {questions.map(({ question, answer }) => (
          <details
            key={question}
            className="group rounded-xl border border-slate-200 bg-white p-5"
          >
            <summary className="cursor-pointer font-semibold text-navy">
              {question}
            </summary>
            <p className="mt-3 text-sm leading-6 text-slate-600">{answer}</p>
          </details>
        ))}
      </section>

      <LegalDisclaimer />
    </div>
  )
}