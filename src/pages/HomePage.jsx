import { ArrowRight, BookOpen, GitBranch, MessageSquareText, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: BookOpen,
    title: 'Sources vérifiables',
    text: "Chaque analyse renvoie vers l'article original du corpus.",
  },
  {
    icon: GitBranch,
    title: 'Analyse par scénarios',
    text: 'Plusieurs qualifications possibles, jamais une décision certaine.',
  },
  {
    icon: MessageSquareText,
    title: 'Explication simple',
    text: 'Le texte juridique est présenté dans un langage plus clair.',
  },
]

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-navy px-6 py-12 text-white shadow-xl shadow-navy/10 sm:px-10 sm:py-16">
        <div className="absolute -right-20 -top-28 size-80 rounded-full border-[40px] border-white/5" aria-hidden="true" />
        <div className="relative max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-slate-100">
            <ShieldCheck size={16} className="text-info" aria-hidden="true" />
            Droit haïtien, sources consultables
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Le droit haïtien, à portée de main.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
            Comprendre le droit haïtien, explorer les scénarios, vérifier les
            sources. Décrivez une situation et découvrez les textes qui peuvent
            aider à l&apos;éclairer.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/assistant"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-blue-600"
            >
              Analyser un cas
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              to="/base-juridique"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-5 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Rechercher dans le droit haïtien
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="features-heading">
        <div className="mb-5 max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            Une aide à la recherche
          </p>
          <h2
            id="features-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-navy"
          >
            Une analyse utile, sans perdre de vue les sources
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-info/10 text-info">
                <Icon size={21} aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-semibold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-navy">Corpus de référence</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Le prototype explore la Constitution haïtienne, le Code pénal, Code fiscale et le
          Code civil. Les références de démonstration sont fictives et ne
          remplacent pas la consultation d&apos;une source juridique vérifiée.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['Constitution', 'Code pénal', 'Code civil', 'Code fiscale'].map((document) => (
            <span
              key={document}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
            >
              {document}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}