import { BookOpenCheck, CircleHelp, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import LegalDisclaimer from '../components/layout/LegalDisclaimer.jsx'

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

export default function RessourcesPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">
          Bien utiliser l&apos;outil
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy">
          Ressources et limites
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          Repères pour comprendre les résultats, consulter les sources et
          protéger vos informations.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
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