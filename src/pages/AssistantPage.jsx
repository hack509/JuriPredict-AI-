import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowUp,
  FileText,
  Info,
  Mic,
  MicOff,
  Paperclip,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAnalysis } from '../context/useAnalysis.js'
import { analyzeCase } from '../services/api.js'

const EXAMPLE =
  'Une personne est entrée dans une maison sans autorisation pendant la nuit et a emporté plusieurs objets.'
const PHONE_PATTERN = /(?:\+?\d[\s().-]*){8,}/
const MAX_FILE_SIZE = 2 * 1024 * 1024
const ACCEPTED_FILE_TYPES = '.txt,.md,.csv,text/plain,text/markdown,text/csv'

export default function AssistantPage() {
  const { facts, setFacts, setResult } = useAnalysis()
  const [attachment, setAttachment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recording, setRecording] = useState(false)
  const [notice, setNotice] = useState('')
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

  useEffect(
    () => () => {
      recognitionRef.current?.stop()
    },
    [],
  )

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">
          Étape 1 · Décrire
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy">
          Décrivez votre situation juridique
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          Expliquez les faits avec vos propres mots. L&apos;outil recherchera des
          textes pertinents et présentera plusieurs pistes à vérifier.
        </p>
      </header>

      <div className="flex gap-3 rounded-xl border border-warn/30 bg-amber-50 p-4 text-sm leading-6 text-slate-700">
        <Info size={19} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
        <p>
          Pour protéger votre vie privée, ne saisissez ni nom complet, ni
          téléphone, ni adresse.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3"
      >
        <label htmlFor="facts" className="block text-sm font-semibold text-navy">
          Quels sont les faits ?
        </label>
        <div className="rounded-2xl border border-slate-300 bg-white p-3 shadow-sm transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 sm:p-4">
          <textarea
            id="facts"
            rows={6}
            value={facts}
            onChange={(event) => setFacts(event.target.value)}
            placeholder={EXAMPLE}
            aria-describedby="facts-help facts-count attachment-help"
            className="w-full resize-y border-0 bg-transparent p-1 leading-6 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          />
          {attachment && (
            <div className="mt-2 flex w-fit max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
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

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
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
                className="grid size-10 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-brand/30 hover:bg-blue-50 hover:text-brand disabled:opacity-50"
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
                className={`grid size-10 place-items-center rounded-full border transition disabled:opacity-50 ${
                  recording
                    ? 'border-red-300 bg-red-50 text-red-600'
                    : 'border-slate-200 text-slate-600 hover:border-brand/30 hover:bg-blue-50 hover:text-brand'
                }`}
              >
                {recording ? (
                  <MicOff size={19} aria-hidden="true" />
                ) : (
                  <Mic size={19} aria-hidden="true" />
                )}
              </button>
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
              aria-label={loading ? 'Analyse en cours' : 'Analyser la situation'}
              title="Analyser la situation"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {loading ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <ArrowUp size={21} strokeWidth={2.5} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
          <p id="facts-help">
            Décrivez les faits sans inclure d&apos;informations personnelles.
          </p>
          <span id="facts-count">{submissionFacts.length} caractères</span>
        </div>
        <p id="attachment-help" className="px-1 text-xs text-slate-500">
          Fichiers texte uniquement (.txt, .md, .csv), jusqu&apos;à 2 Mo. Le texte
          est lu dans votre navigateur avant l&apos;analyse.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => {
              setFacts(EXAMPLE)
              setAttachment(null)
              setNotice('')
              setError('')
            }}
            className="w-fit rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Utiliser un exemple
          </button>
          {submissionFacts.length < 20 && (
            <p className="text-xs text-slate-500">
              Saisissez au moins 20 caractères pour lancer l&apos;analyse.
            </p>
          )}
        </div>
        {hasPhoneNumber && (
          <p className="flex gap-2 text-sm text-warn" role="status">
            <AlertCircle size={17} className="shrink-0" aria-hidden="true" />
            Un numéro de téléphone semble présent dans la description ou le
            fichier. Retirez-le avant de continuer.
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          >
            <Info size={17} className="shrink-0" aria-hidden="true" />
            {notice}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}
      </form>

      <p className="text-xs leading-5 text-slate-500">
        Les informations saisies servent à la démonstration de cette analyse.
        Évitez les détails permettant d&apos;identifier une personne.
      </p>
    </div>
  )
}