import { AlertTriangle } from 'lucide-react'

export default function LegalDisclaimer() {
  return (
    <aside
      role="note"
      className="flex gap-3 rounded-xl border border-warn/30 bg-amber-50 p-4 text-sm leading-6 text-slate-700"
    >
      <AlertTriangle
        className="mt-1 shrink-0 text-warn"
        size={18}
        aria-hidden="true"
      />
      <p>
        JuriPredict est un outil d&apos;information et d&apos;analyse juridique
        assisté par intelligence artificielle. Les résultats peuvent contenir
        des erreurs ou être incomplets. Ils ne constituent pas un avis juridique
        professionnel et ne remplacent pas les conseils d&apos;un avocat ou la
        décision d&apos;une juridiction compétente.
      </p>
    </aside>
  )
}
