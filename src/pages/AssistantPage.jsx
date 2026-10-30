import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowUp,
  BookOpen,
  FileText,
  Info,
  Menu,
  Mic,
  MicOff,
  Paperclip,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAnalysis } from '../context/useAnalysis.js'
import { analyzeCase } from '../services/api.js'
import LogoMark from '../components/layout/LogoMark.jsx'

const EXAMPLE =
  'Une personne est entrée dans une maison sans autorisation pendant la nuit et a emporté plusieurs objets.'
const PHONE_PATTERN = /(?:\+?\d[\s().-]*){8,}/
const MAX_FILE_SIZE = 2 * 1024 * 1024
const ACCEPTED_FILE_TYPES = '.txt,.md,.csv,text/plain,text/markdown,text/csv'
const SUGGESTIONS = [
  {
    icon: Scale,
    title: 'Comprendre une situation',
    prompt: EXAMPLE,
  },
  {
    icon: BookOpen,
    title: 'Explorer le droit haïtien',
    prompt: 'Quels sont les principes importants de la Constitution haïtienne ?',
  },
  {
    icon: ShieldCheck,
    title: 'Vérifier mes droits',
    prompt: 'Je souhaite comprendre quels textes pourraient concerner ma situation.',
  },
]

export default function AssistantPage() {
  const { facts, setFacts, setResult } = useAnalysis()
  const [attachment, setAttachment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recording, setRecording] = useState(false)
  const [notice, setNotice] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const recognitionRef = useRef(null)
  const submissionFacts = [
    facts.trim(),
    attachment
      ? `Contenu du document « ${attachment.name} » :\n${attachment.content}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n')
  const hasPhoneNumber = PHONE_PATTERN.test(submissionFacts)

  async function handleSubmit(event) {
    event.preventDefault()
    if (submissionFacts.length < 20 || loading || hasPhoneNumber) return

    setLoading(true)
    setError('')
    try {
      const data = await analyzeCase(submissionFacts)
      setFacts(submissionFacts)
      setResult(data)
      navigate('/resultat')
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "L'analyse a échoué. Réessayez dans un instant.",
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!/\.(txt|md|csv)$/i.test(file.name)) {
      setNotice('Choisissez un fichier texte .txt, .md ou .csv.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setNotice('Le fichier doit faire 2 Mo ou moins.')
      return
    }

    try {
      const content = (await file.text()).trim()
      if (!content) {
        setNotice('Ce fichier ne contient pas de texte à analyser.')
        return
      }

      setAttachment({ name: file.name, content })
      setNotice('')
      setError('')
    } catch {
      setNotice('Impossible de lire ce fichier. Essayez un fichier texte.')
    }
  }

  function handleMicrophoneClick() {
    if (recording) {
      recognitionRef.current?.stop()
      return
    }

    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setNotice(
        'La dictée vocale n’est pas disponible dans ce navigateur. Essayez Chrome ou Edge.',
      )
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'fr-FR'
    recognition.continuous = true
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .map((result) => result[0].transcript.trim())
        .filter(Boolean)
        .join(' ')

      if (transcript) {
        setFacts((current) =>
          [current.trim(), transcript].filter(Boolean).join(' '),
        )
        setNotice('')
      }
    }
    recognition.onerror = (event) => {
      const messages = {
        'not-allowed':
          'Accordez l’accès au microphone dans les paramètres du navigateur, puis réessayez.',
        'service-not-allowed':
          'Le navigateur n’autorise pas l’utilisation de la dictée vocale.',
        'no-speech': 'Aucune parole détectée. Vous pouvez réessayer.',
        network: 'La dictée vocale est indisponible en raison d’une erreur réseau.',
      }
      if (event.error !== 'aborted') {
        setNotice(
          messages[event.error] ??
            'La dictée vocale a échoué. Vous pouvez réessayer.',
        )
      }
      setRecording(false)
    }
    recognition.onend = () => setRecording(false)
    recognitionRef.current = recognition
    setNotice('')

    try {
      recognition.start()
      setRecording(true)
    } catch {
      recognitionRef.current = null
      setNotice(
        'Impossible de démarrer la dictée. Vérifiez que le microphone n’est pas déjà utilisé.',
      )
    }
  }

  function startNewConversation() {
    setFacts('')
    setResult(null)
    setAttachment(null)
    setError('')
    setNotice('')
    setSidebarOpen(false)
  }

  useEffect(
    () => () => {
      recognitionRef.current?.stop()
    },
    [],
  )

  return (
    <div className="flex h-screen overflow-hidden bg-white text-slate-800">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fermer la navigation"
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] shrink-0 flex-col border-r border-slate-200 bg-slate-50 p-3 transition-transform md:static md:z-auto md:w-[260px] md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigation de l’assistant"
      >
        <div className="flex items-center justify-between gap-2 px-2 py-2">
          <Link to="/" className="flex items-center gap-2 rounded-lg">
            <LogoMark className="size-9" />
            <span className="rounded bg-white px-1.5 py-1">
              <img src="/logo-text.png" alt="JuriPredict AI" className="h-4 w-auto" />
            </span>
          </Link>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-200 md:hidden"
            aria-label="Fermer la navigation"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={startNewConversation}
          className="mt-5 flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          <Plus size={18} aria-hidden="true" />
          Nouvelle conversation
        </button>

        <nav className="mt-3 space-y-1" aria-label="Outils">
          <Link
            to="/base-juridique"
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-slate-600 transition hover:bg-slate-200/70 hover:text-navy"
          >
            <Search size={17} aria-hidden="true" />
            Rechercher dans les textes
          </Link>
          <Link
            to="/ressources"
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-slate-600 transition hover:bg-slate-200/70 hover:text-navy"
          >
            <BookOpen size={17} aria-hidden="true" />
            Ressources juridiques
          </Link>
        </nav>

        <div className="mt-8 border-t border-slate-200 pt-5">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Conversations récentes
          </p>
          <p className="px-3 pt-3 text-sm leading-6 text-slate-500">
            Vos conversations apparaîtront ici.
          </p>
        </div>

        <div className="mt-auto border-t border-slate-200 pt-3">
          <Link
            to="/connexion"
            className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-200/70"
          >
            <span className="grid size-9 place-items-center rounded-full bg-navy text-sm font-semibold text-white">
              J
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-slate-700">
                Connexion
              </span>
              <span className="block text-xs text-slate-500">
                Accéder à votre compte
              </span>
            </span>
          </Link>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="grid size-9 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 md:hidden"
              aria-label="Ouvrir la navigation"
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <span className="text-sm font-semibold text-navy">Assistant IA</span>
            <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:inline-flex">
              Droit haïtien
            </span>
          </div>
          <Link
            to="/connexion"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-navy"
          >
            Se connecter
          </Link>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          <section className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4">
            <div className="my-auto w-full max-w-3xl py-10 sm:py-14">
              <div className="mb-9 text-center">
                <span className="mx-auto mb-5 grid size-12 place-items-center rounded-2xl bg-blue-50 text-brand">
                  <Scale size={23} aria-hidden="true" />
                </span>
                <h1 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
                  Comment puis-je vous aider ?
                </h1>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
                  Décrivez votre situation ou posez une question sur le droit
                  haïtien. Les réponses sont des pistes à vérifier dans les textes.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {SUGGESTIONS.map(({ icon: Icon, title, prompt }) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => setFacts(prompt)}
                    className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-brand/30 hover:bg-blue-50/40"
                  >
                    <span className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-white group-hover:text-brand">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <span className="mt-3 block text-sm font-medium text-slate-700">
                      {title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {prompt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="w-full shrink-0 px-4 pb-4 sm:px-6 sm:pb-6">
            <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
              <label htmlFor="facts" className="sr-only">
                Votre question ou les faits de votre situation
              </label>
              <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition focus-within:border-slate-300">
                <textarea
                  id="facts"
                  rows={3}
                  value={facts}
                  onChange={(event) => setFacts(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      event.currentTarget.form?.requestSubmit()
                    }
                  }}
                  placeholder="Posez une question ou décrivez votre situation..."
                  aria-describedby="facts-help facts-count"
                  className="max-h-40 min-h-16 w-full resize-y border-0 bg-transparent px-2 py-2 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0 sm:text-base"
                />
                {attachment && (
                  <div className="mx-1 mb-2 flex w-fit max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <FileText size={17} className="shrink-0 text-brand" aria-hidden="true" />
                    <span className="truncate text-sm text-slate-700">
                      {attachment.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      aria-label={`Retirer le fichier ${attachment.name}`}
                      className="grid size-7 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                    >
                      <X size={15} aria-hidden="true" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                  <div className="flex items-center gap-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_FILE_TYPES}
                      onChange={handleFileChange}
                      className="sr-only"
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      aria-label="Joindre un fichier texte"
                      title="Joindre un fichier texte (.txt, .md, .csv)"
                      className="grid size-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-navy disabled:opacity-50"
                    >
                      <Paperclip size={19} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={handleMicrophoneClick}
                      disabled={loading}
                      aria-label={
                        recording ? 'Arrêter la dictée vocale' : 'Dicter les faits'
                      }
                      aria-pressed={recording}
                      title={
                        recording
                          ? 'Arrêter la dictée vocale'
                          : 'Dicter les faits en français'
                      }
                      className={`grid size-9 place-items-center rounded-full transition disabled:opacity-50 ${
                        recording
                          ? 'bg-red-50 text-red-600'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-navy'
                      }`}
                    >
                      {recording ? (
                        <MicOff size={19} aria-hidden="true" />
                      ) : (
                        <Mic size={19} aria-hidden="true" />
                      )}
                    </button>
                    <span id="facts-count" className="ml-1 text-xs text-slate-400">
                      {submissionFacts.length}
                    </span>
                    {recording && (
                      <span className="text-xs font-medium text-red-600" role="status">
                        Dictée en cours
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={
                      submissionFacts.length < 20 || loading || hasPhoneNumber
                    }
                    aria-label={loading ? 'Analyse en cours' : 'Envoyer la question'}
                    title="Envoyer"
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-navy text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {loading ? (
                      <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <ArrowUp size={21} strokeWidth={2.5} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1">
                <p id="facts-help" className="text-xs text-slate-500">
                  Évitez les noms, numéros de téléphone et adresses.
                  {' '}Fichiers texte uniquement, 2 Mo maximum.
                </p>
                <p className="text-xs text-slate-400">
                  Maj + Entrée pour aller à la ligne
                </p>
              </div>
              {hasPhoneNumber && (
                <p className="mt-3 flex gap-2 text-sm text-warn" role="status">
                  <AlertCircle size={17} className="shrink-0" aria-hidden="true" />
                  Un numéro de téléphone semble présent. Retirez-le avant de continuer.
                </p>
              )}
              {notice && (
                <p
                  role="status"
                  className="mt-3 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
                >
                  <Info size={17} className="shrink-0" aria-hidden="true" />
                  {notice}
                </p>
              )}
              {error && (
                <p
                  role="alert"
                  className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                >
                  {error}
                </p>
              )}
              <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                JuriPredict fournit des informations, pas un avis juridique.
                Vérifiez toujours les textes officiels.
              </p>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
