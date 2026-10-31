import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Archive,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  FileText,
  FolderOpen,
  Globe2,
  History,
  LoaderCircle,
  Menu,
  MessageSquarePlus,
  MoreHorizontal,
  Paperclip,
  Pin,
  Plus,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Square,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import LogoMark from '../components/layout/LogoMark.jsx'
import { sendChatMessage } from '../services/chat.js'
import './AssistantPage.css'

const CONVERSATIONS_KEY = 'juripredict.conversations.v1'
const SETTINGS_KEY = 'juripredict.settings.v1'
const MAX_FILE_SIZE = 20 * 1024 * 1024
const ACCEPTED_FILES = '.pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp'

const MODELS = [
  {
    id: 'standard',
    name: 'JuriPredict Standard',
    description: 'Assistance juridique générale',
    icon: Sparkles,
  },
  {
    id: 'research',
    name: 'JuriPredict Research',
    description: 'Recherche approfondie dans les sources',
    icon: BookOpen,
  },
  {
    id: 'document',
    name: 'JuriPredict Document',
    description: 'Analyse de documents juridiques',
    icon: FileText,
  },
  {
    id: 'reasoning',
    name: 'JuriPredict Reasoning',
    description: 'Étude structurée de situations complexes',
    icon: ShieldCheck,
  },
]

const MODES = [
  { id: 'chat', label: 'Discussion' },
  { id: 'research', label: 'Recherche juridique' },
  { id: 'document', label: 'Analyse de document' },
]

const SUGGESTIONS = [
  {
    title: 'Comprendre un article de loi',
    prompt: 'Comment lire et comprendre un article d’un texte juridique haïtien ?',
    icon: BookOpen,
  },
  {
    title: 'Explorer une situation',
    prompt: 'Quels faits faudrait-il préciser pour étudier une situation juridique ?',
    icon: ShieldCheck,
  },
  {
    title: 'Lancer une recherche',
    prompt: 'Comment retrouver une disposition dans les textes haïtiens disponibles ?',
    icon: Search,
  },
  {
    title: 'Préparer un résumé',
    prompt: 'Aidez-moi à structurer le résumé d’un document juridique.',
    icon: FileText,
  },
]

function readStoredState(key, fallback, isValid) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return { value: fallback, error: '' }
    const value = JSON.parse(raw)
    if (!isValid(value)) throw new Error('Format de données invalide.')
    return { value, error: '' }
  } catch (error) {
    console.error(`Impossible de lire ${key}.`, error)
    return { value: fallback, error: 'Certaines données locales n’ont pas pu être lues.' }
  }
}

function createConversation() {
  return {
    id: crypto.randomUUID(),
    title: 'Nouvelle conversation',
    messages: [],
    updatedAt: new Date().toISOString(),
    pinned: false,
    archived: false,
  }
}

function formatConversationTitle(message) {
  const firstLine = message.trim().split('\n')[0]
  return firstLine.length > 48 ? `${firstLine.slice(0, 48).trim()}…` : firstLine
}

function downloadConversation(conversation, format) {
  const content = conversation.messages
    .map((message) => {
      const heading = message.role === 'user' ? 'Vous' : 'JuriPredict'
      const files = message.attachments?.length
        ? `\n\nPièces jointes : ${message.attachments.map((file) => file.name).join(', ')}`
        : ''
      return `## ${heading}\n\n${message.content}${files}`
    })
    .join('\n\n---\n\n')
  const mimeType = format === 'md' ? 'text/markdown' : 'text/plain'
  const extension = format === 'md' ? 'md' : 'txt'
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${conversation.title.replace(/[<>:"/\\|?*]/g, '-').slice(0, 60)}.${extension}`
  anchor.click()
  URL.revokeObjectURL(url)
}

function LegalSources({ sources = [] }) {
  if (!sources.length) return null

  return (
    <section className="jp-sources" aria-label="Sources communiquées par le service">
      <h3>Sources retournées par le service</h3>
      {sources.map((source, index) => {
        const label = [source.document_title, source.article_number]
          .filter(Boolean)
          .join(' · ')
        return (
          <article className="jp-source" key={source.id ?? `${label}-${index}`}>
            <BookOpen size={16} aria-hidden="true" />
            <div>
              <strong>{label || source.title || 'Source juridique'}</strong>
              {source.excerpt && <p>{source.excerpt}</p>}
              {source.verified === true && (
                <span className="jp-verified">Source vérifiée par le service</span>
              )}
            </div>
            {source.url && (
              <a href={source.url} target="_blank" rel="noreferrer">
                Ouvrir
              </a>
            )}
          </article>
        )
      })}
    </section>
  )
}

export default function AssistantPage() {
  const initialConversations = useMemo(
    () =>
      readStoredState(CONVERSATIONS_KEY, [], (value) => Array.isArray(value)),
    [],
  )
  const initialSettings = useMemo(
    () =>
      readStoredState(SETTINGS_KEY, {
        language: 'fr',
        responseLanguage: 'fr-FR',
        style: 'accessible',
        audience: 'general',
        theme: 'light',
        history: true,
        updates: false,
        sidebarMode: 'hover',
      }, (value) => value && typeof value === 'object' && !Array.isArray(value)),
    [],
  )
  const [conversations, setConversations] = useState(initialConversations.value)
  const [settings, setSettings] = useState(initialSettings.value)
  const [activeId, setActiveId] = useState(
    initialConversations.value[0]?.id ?? null,
  )
  const [draft, setDraft] = useState('')
  const [attachments, setAttachments] = useState([])
  const [notice, setNotice] = useState(
    initialConversations.error || initialSettings.error,
  )
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)
  const [modeOpen, setModeOpen] = useState(false)
  const [modelId, setModelId] = useState('standard')
  const [modeId, setModeId] = useState('chat')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [menuId, setMenuId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)
  const messageEndRef = useRef(null)
  const requestControllerRef = useRef(null)
  const activeConversation = conversations.find(({ id }) => id === activeId)
  const activeModel = MODELS.find(({ id }) => id === modelId) ?? MODELS[0]
  const activeMode = MODES.find(({ id }) => id === modeId) ?? MODES[0]

  const visibleConversations = conversations
    .filter(({ archived }) => archived === showArchived)
    .filter(({ title }) =>
      title.toLocaleLowerCase().includes(searchTerm.trim().toLocaleLowerCase()),
    )
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt))

  useEffect(() => {
    if (!initialConversations.error && settings.history) {
      try {
        localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations))
      } catch (storageError) {
        console.error('Impossible de sauvegarder les conversations.', storageError)
        // A failed persistence effect must be visible to the user.
        // oxlint-disable-next-line react/set-state-in-effect
        setNotice('La sauvegarde locale a échoué. Vérifiez l’espace disponible du navigateur.')
      }
    } else if (settings.history === false) {
      localStorage.removeItem(CONVERSATIONS_KEY)
    }
  }, [conversations, initialConversations.error, settings.history])

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch (storageError) {
      console.error('Impossible de sauvegarder les préférences.', storageError)
      // A failed persistence effect must be visible to the user.
      // oxlint-disable-next-line react/set-state-in-effect
      setNotice('Les préférences n’ont pas pu être sauvegardées dans ce navigateur.')
    }
  }, [settings])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [activeConversation?.messages, busy])

  useEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`
  }, [draft])

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === 'k') {
        event.preventDefault()
        startNewConversation()
      }
      if (event.key === 'Escape') {
        setSidebarOpen(false)
        setSettingsOpen(false)
        setShareOpen(false)
        setMenuId(null)
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  useEffect(
    () => () => requestControllerRef.current?.abort(),
    [],
  )

  function startNewConversation() {
    setActiveId(null)
    setDraft('')
    setAttachments([])
    setEditId(null)
    setError('')
    setNotice('')
    setSidebarOpen(false)
  }

  function setConversationMessages(conversationId, update) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: update(conversation.messages),
              updatedAt: new Date().toISOString(),
            }
          : conversation,
      ),
    )
  }

  async function submitMessage(event) {
    event?.preventDefault()
    const content = draft.trim()
    if ((!content && !attachments.length) || busy) return

    const conversation =
      activeConversation ?? createConversation()
    const message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      attachments: attachments.map(({ id, name, size, type }) => ({
        id,
        name,
        size,
        type,
      })),
      createdAt: new Date().toISOString(),
    }
    const currentEditId = editId
    setConversations((current) => {
      const exists = current.some(({ id }) => id === conversation.id)
      if (!exists) {
        return [
          {
            ...conversation,
            title: content ? formatConversationTitle(content) : 'Document à examiner',
            messages: [message],
          },
          ...current,
        ]
      }
      return current.map((item) =>
        item.id === conversation.id
          ? {
              ...item,
              title: item.messages.length
                ? item.title
                : content
                  ? formatConversationTitle(content)
                  : 'Document à examiner',
              messages: currentEditId
                ? [
                    ...item.messages.slice(
                      0,
                      item.messages.findIndex(({ id }) => id === currentEditId),
                    ),
                    message,
                  ]
                : [...item.messages, message],
              updatedAt: new Date().toISOString(),
            }
          : item,
      )
    })
    setActiveId(conversation.id)
    setDraft('')
    setAttachments([])
    setEditId(null)
    setError('')
    setBusy(true)
    requestControllerRef.current = new AbortController()

    try {
      const result = await sendChatMessage({
        conversationId: conversation.id,
        message: content,
        mode: modeId,
        profile: modelId,
        files: attachments,
        signal: requestControllerRef.current.signal,
      })
      const assistantMessage = {
        id: result.id ?? crypto.randomUUID(),
        role: 'assistant',
        content: result.content,
        citations: result.citations ?? [],
        createdAt: new Date().toISOString(),
      }
      setConversationMessages(conversation.id, (messages) => [
        ...messages,
        assistantMessage,
      ])
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        console.error('Échec de la requête de conversation.', requestError)
      }
      setError(
        requestError.name === 'AbortError'
          ? 'La requête a été arrêtée. Aucune réponse n’a été reçue.'
          : requestError instanceof Error
          ? requestError.message
          : 'Le service de conversation est indisponible.',
      )
    } finally {
      requestControllerRef.current = null
      setBusy(false)
    }
  }

  function handleFileSelection(fileList) {
    const selectedFiles = Array.from(fileList ?? [])
    const allowed = /\.(pdf|docx|txt|md|png|jpe?g|webp)$/i
    const nextFiles = []
    for (const file of selectedFiles) {
      if (!allowed.test(file.name)) {
        setNotice(`${file.name} : format non pris en charge.`)
      } else if (file.size > MAX_FILE_SIZE) {
        setNotice(`${file.name} : la taille maximale est de 20 Mo.`)
      } else {
        nextFiles.push({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          file,
        })
      }
    }
    if (nextFiles.length) {
      setAttachments((current) => [...current, ...nextFiles])
      setNotice('Aperçu local uniquement : le fichier ne sera pas transmis sans service documentaire connecté.')
    }
  }

  function beginEdit(message) {
    setEditId(message.id)
    setDraft(message.content)
    setError('')
    textareaRef.current?.focus()
  }

  async function regenerateResponse() {
    const messages = activeConversation?.messages ?? []
    const lastUser = [...messages].reverse().find(({ role }) => role === 'user')
    if (!lastUser || busy) return
    setEditId(lastUser.id)
    setDraft(lastUser.content)
    window.setTimeout(() => textareaRef.current?.form?.requestSubmit(), 0)
  }

  function updateConversation(id, updates) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...conversation, ...updates } : conversation,
      ),
    )
    setMenuId(null)
  }

  function renameConversation(conversation) {
    const title = window.prompt('Nouveau titre de conversation', conversation.title)
    if (title?.trim()) updateConversation(conversation.id, { title: title.trim() })
  }

  function deleteConversation(conversation) {
    if (!window.confirm(`Supprimer « ${conversation.title} » de ce navigateur ?`)) return
    setConversations((current) =>
      current.filter(({ id }) => id !== conversation.id),
    )
    if (activeId === conversation.id) setActiveId(null)
    setMenuId(null)
  }

  async function copyText(text, id) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      window.setTimeout(() => setCopiedId(null), 1800)
    } catch (clipboardError) {
      console.error('Impossible de copier le texte.', clipboardError)
      setNotice('La copie automatique est indisponible dans ce navigateur.')
    }
  }

  function shareResponse(message) {
    if (navigator.share) {
      navigator.share({ title: 'Réponse JuriPredict', text: message.content }).catch((shareError) => {
        if (shareError.name !== 'AbortError') {
          console.error('Le partage a échoué.', shareError)
          setNotice('Le partage natif a échoué.')
        }
      })
      return
    }
    copyText(message.content, message.id)
  }

  function readAloud(message) {
    if (!('speechSynthesis' in window)) {
      setNotice('La lecture à voix haute n’est pas disponible dans ce navigateur.')
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(message.content)
    utterance.lang = settings.responseLanguage === 'ht' ? 'ht-HT' : settings.responseLanguage
    window.speechSynthesis.speak(utterance)
  }

  function updateSetting(key, value) {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  const hasMessages = Boolean(activeConversation?.messages.length)

  return (
    <div
      className={`jp-app ${settings.theme === 'dark' ? 'jp-dark' : ''}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        handleFileSelection(event.dataTransfer.files)
      }}
    >
      {sidebarOpen && (
        <button
          className="jp-backdrop"
          type="button"
          aria-label="Fermer la navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`jp-sidebar ${settings.sidebarMode !== 'pinned' ? 'jp-sidebar-hover-mode' : ''} ${sidebarOpen ? 'jp-sidebar-open' : ''}`}
        aria-label="Navigation de l’assistant"
      >
        <div className="jp-brand">
          <Link to="/" className="jp-brand-link" aria-label="Accueil JuriPredict">
            <LogoMark className="size-9" />
            <span>JuriPredict</span>
          </Link>
          <button
            type="button"
            className="jp-icon-button jp-sidebar-pin"
            onClick={() => updateSetting(
              'sidebarMode',
              settings.sidebarMode === 'pinned' ? 'hover' : 'pinned',
            )}
            aria-label={settings.sidebarMode === 'pinned' ? 'Replier le menu au survol' : 'Garder le menu ouvert'}
            title={settings.sidebarMode === 'pinned' ? 'Replier au survol' : 'Garder le menu ouvert'}
            aria-pressed={settings.sidebarMode === 'pinned'}
          >
            <Pin size={17} />
          </button>
          <button
            type="button"
            className="jp-icon-button jp-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </button>
        </div>

        <button
          type="button"
          className="jp-new-chat"
          onClick={startNewConversation}
          aria-label="Nouvelle conversation"
          title="Nouvelle conversation"
        >
          <span className="jp-new-chat-icon" aria-hidden="true">
            <Plus size={18} strokeWidth={2.5} />
          </span>
          <span>Nouvelle conversation</span>
          <span className="jp-shortcut">⌘ K</span>
        </button>

        <div className="jp-sidebar-tools">
          <button
            type="button"
            className={searchOpen ? 'jp-tool-active' : ''}
            aria-label="Rechercher une conversation"
            title="Rechercher"
            onClick={() => {
              setSearchOpen((open) => !open)
              setSearchTerm('')
            }}
          >
            <Search size={17} />
            <span>Rechercher</span>
          </button>
          <Link to="/base-juridique" title="Explorer les textes">
            <BookOpen size={17} /> <span>Explorer les textes</span>
          </Link>
          <button
            type="button"
            className={showArchived ? 'jp-tool-active' : ''}
            title={showArchived ? 'Conversations récentes' : 'Archives'}
            aria-label={showArchived ? 'Conversations récentes' : 'Archives'}
            onClick={() => setShowArchived((current) => !current)}
          >
            {showArchived ? <History size={17} /> : <Archive size={17} />}
            <span>{showArchived ? 'Conversations récentes' : 'Archives'}</span>
          </button>
        </div>

        {searchOpen && (
          <label className="jp-search">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Rechercher une conversation"
              aria-label="Rechercher une conversation"
              autoFocus
            />
            <button type="button" onClick={() => setSearchOpen(false)} aria-label="Fermer la recherche">
              <X size={15} />
            </button>
          </label>
        )}

        <div className="jp-history-heading">
          <span>{showArchived ? 'Archivées' : 'Récents'}</span>
          <span>{visibleConversations.length}</span>
        </div>
        <nav className="jp-conversation-list" aria-label="Historique des conversations">
          {visibleConversations.map((conversation) => (
            <div
              className={`jp-conversation ${conversation.id === activeId ? 'jp-conversation-active' : ''}`}
              key={conversation.id}
            >
              <button
                type="button"
                className="jp-conversation-select"
                onClick={() => {
                  setActiveId(conversation.id)
                  setSidebarOpen(false)
                  setError('')
                }}
                title={conversation.title}
                aria-label={`Ouvrir la conversation ${conversation.title}`}
              >
                {conversation.pinned ? <Pin size={14} /> : <MessageSquarePlus size={14} />}
                <span>{conversation.title}</span>
              </button>
              <button
                type="button"
                className="jp-conversation-menu-button"
                onClick={() => setMenuId(menuId === conversation.id ? null : conversation.id)}
                aria-label={`Actions pour ${conversation.title}`}
                aria-expanded={menuId === conversation.id}
              >
                <MoreHorizontal size={17} />
              </button>
              {menuId === conversation.id && (
                <div className="jp-context-menu">
                  <button type="button" onClick={() => renameConversation(conversation)}>
                    <FileText size={15} /> Renommer
                  </button>
                  <button
                    type="button"
                    onClick={() => updateConversation(conversation.id, { pinned: !conversation.pinned })}
                  >
                    <Pin size={15} /> {conversation.pinned ? 'Désépingler' : 'Épingler'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateConversation(conversation.id, { archived: !conversation.archived })}
                  >
                    <Archive size={15} /> {conversation.archived ? 'Désarchiver' : 'Archiver'}
                  </button>
                  <button type="button" className="jp-danger" onClick={() => deleteConversation(conversation)}>
                    <Trash2 size={15} /> Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}
          {visibleConversations.length === 0 && (
            <p className="jp-empty-history">
              {searchTerm ? 'Aucun résultat pour cette recherche.' : 'Vos conversations apparaîtront ici.'}
            </p>
          )}
        </nav>

        <div className="jp-sidebar-bottom">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            title="Paramètres"
            aria-label="Paramètres"
          >
            <Settings size={17} /> <span>Paramètres</span>
          </button>
          <div className="jp-profile">
            <span className="jp-avatar">J</span>
            <div><strong>Mode invité</strong><small>Conversations sur cet appareil</small></div>
            <Link to="/connexion" aria-label="Se connecter">↗</Link>
          </div>
        </div>
      </aside>

      <main className="jp-main">
        <header className="jp-header">
          <div className="jp-header-left">
            <button
              type="button"
              className="jp-icon-button jp-menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Ouvrir la navigation"
            >
              <Menu size={20} />
            </button>
            <div className="jp-model-wrap">
              <button
                type="button"
                className="jp-model-button"
                onClick={() => setModelOpen((open) => !open)}
                aria-expanded={modelOpen}
              >
                {activeModel.name}
                <ChevronDown size={16} />
              </button>
              {modelOpen && (
                <div className="jp-dropdown jp-model-dropdown">
                  <p>Profils de produit</p>
                  {MODELS.map(({ id, name, description, icon: Icon }) => (
                    <button
                      type="button"
                      key={id}
                      className={modelId === id ? 'jp-dropdown-selected' : ''}
                      onClick={() => {
                        setModelId(id)
                        setModelOpen(false)
                      }}
                    >
                      <Icon size={17} />
                      <span><strong>{name}</strong><small>{description}</small></span>
                      {modelId === id && <Check size={16} />}
                    </button>
                  ))}
                  <span className="jp-dropdown-note">Le profil est une préférence d’interface ; aucun modèle IA n’est connecté.</span>
                </div>
              )}
            </div>
            <span className="jp-beta">APERÇU</span>
          </div>
          <div className="jp-header-actions">
            {activeConversation && (
              <>
                <button
                  type="button"
                  className="jp-header-action jp-share-button"
                  onClick={() => setShareOpen(true)}
                >
                  <Share2 size={16} /> Partager
                </button>
                <div className="jp-export-wrap">
                  <button
                    type="button"
                    className="jp-icon-button"
                    aria-label="Exporter la conversation"
                    title="Exporter"
                    onClick={() => downloadConversation(activeConversation, 'md')}
                  >
                    <ArrowDown size={18} />
                  </button>
                  <button
                    type="button"
                    className="jp-icon-button jp-print-button"
                    aria-label="Imprimer la conversation"
                    title="Imprimer"
                    onClick={() => window.print()}
                  >
                    <FolderOpen size={18} />
                  </button>
                </div>
              </>
            )}
            <button
              type="button"
              className="jp-icon-button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Ouvrir les paramètres"
              title="Paramètres"
            >
              <Settings size={18} />
            </button>
            <Link to="/connexion" className="jp-sign-in">Se connecter</Link>
          </div>
        </header>

        <div className={`jp-workspace ${hasMessages ? 'jp-workspace-chat' : ''}`}>
          <section className="jp-conversation-view" aria-label="Conversation">
            {!hasMessages ? (
              <div className="jp-welcome">
                <div className="jp-welcome-icon"><LogoMark className="size-12" /></div>
                <span className="jp-eyebrow"><span /> Votre espace de recherche juridique</span>
                <h1>Bonjour, comment puis-je vous aider ?</h1>
                <p className="jp-welcome-copy">
                  Explorez le droit haïtien, analysez des textes juridiques et
                  obtenez des réponses fondées sur des références consultables.
                </p>
                <div className="jp-mode-switch" role="group" aria-label="Mode de travail">
                  {MODES.map((mode) => (
                    <button
                      type="button"
                      key={mode.id}
                      className={modeId === mode.id ? 'jp-mode-selected' : ''}
                      onClick={() => setModeId(mode.id)}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
                <div className="jp-suggestions">
                  {SUGGESTIONS.map(({ title, prompt, icon: Icon }) => (
                    <button
                      type="button"
                      key={title}
                      onClick={() => {
                        setDraft(prompt)
                        textareaRef.current?.focus()
                      }}
                    >
                      <span className="jp-suggestion-icon"><Icon size={17} /></span>
                      <span><strong>{title}</strong><small>{prompt}</small></span>
                      <ArrowUp size={16} />
                    </button>
                  ))}
                </div>
                <div className="jp-legal-note">
                  <ShieldCheck size={16} />
                  Les références juridiques doivent être vérifiées dans les textes officiels.
                </div>
              </div>
            ) : (
              <div className="jp-messages">
                <div className="jp-chat-title">
                  <span>{activeConversation.title}</span>
                  <span>{activeMode.label}</span>
                </div>
                {activeConversation.messages.map((message, index) => (
                  <article
                    className={`jp-message jp-message-${message.role}`}
                    key={message.id}
                  >
                    {message.role === 'assistant' && (
                      <div className="jp-message-avatar"><LogoMark className="size-8" /></div>
                    )}
                    <div className="jp-message-body">
                      <div className="jp-message-author">
                        {message.role === 'user' ? 'Vous' : 'JuriPredict'}
                        <time>{new Intl.DateTimeFormat('fr', { hour: '2-digit', minute: '2-digit' }).format(new Date(message.createdAt))}</time>
                      </div>
                      {message.content && <p className="jp-message-content">{message.content}</p>}
                      {message.attachments?.length > 0 && (
                        <div className="jp-message-files">
                          {message.attachments.map((file) => (
                            <span key={file.id}><FileText size={16} /> {file.name}</span>
                          ))}
                          <small>Fichier référencé localement ; aucun traitement documentaire n’a été effectué.</small>
                        </div>
                      )}
                      {message.role === 'assistant' && <LegalSources sources={message.citations} />}
                      {message.role === 'user' ? (
                        <div className="jp-message-actions">
                          <button type="button" onClick={() => beginEdit(message)} title="Modifier le message">
                            <FileText size={15} /> Modifier
                          </button>
                        </div>
                      ) : (
                        <div className="jp-message-actions">
                          <button
                            type="button"
                            onClick={() => copyText(message.content, message.id)}
                            title="Copier la réponse"
                          >
                            {copiedId === message.id ? <Check size={15} /> : <Copy size={15} />}
                            {copiedId === message.id ? 'Copié' : 'Copier'}
                          </button>
                          <button
                            type="button"
                            aria-label="Réponse utile"
                            aria-pressed={message.feedback === 'up'}
                            onClick={() => setConversationMessages(activeId, (items) =>
                              items.map((item) => item.id === message.id ? { ...item, feedback: item.feedback === 'up' ? null : 'up' } : item))}
                          ><ThumbsUp size={15} /></button>
                          <button
                            type="button"
                            aria-label="Réponse non utile"
                            aria-pressed={message.feedback === 'down'}
                            onClick={() => setConversationMessages(activeId, (items) =>
                              items.map((item) => item.id === message.id ? { ...item, feedback: item.feedback === 'down' ? null : 'down' } : item))}
                          ><ThumbsDown size={15} /></button>
                          <button type="button" onClick={() => readAloud(message)} title="Lire à voix haute">
                            <Globe2 size={15} /> Lire
                          </button>
                          <button type="button" onClick={() => shareResponse(message)} title="Partager la réponse">
                            <Share2 size={15} />
                          </button>
                          {index === activeConversation.messages.length - 1 && (
                            <button type="button" onClick={regenerateResponse} title="Régénérer la réponse">
                              <Sparkles size={15} /> Réessayer
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
                {busy && (
                  <div className="jp-loading" role="status">
                    <LoaderCircle size={18} className="jp-spinner" /> Connexion au service…
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>
            )}
          </section>

          <section className="jp-composer-zone">
            {error && (
              <div className="jp-alert" role="alert">
                <ShieldCheck size={17} />
                <span><strong>Aucune réponse générée.</strong> {error}</span>
                <button type="button" onClick={() => setError('')} aria-label="Fermer le message"><X size={16} /></button>
              </div>
            )}
            {notice && (
              <div className="jp-notice" role="status">
                <span>{notice}</span>
                <button type="button" onClick={() => setNotice('')} aria-label="Fermer la notification"><X size={15} /></button>
              </div>
            )}
            {editId && (
              <div className="jp-editing">
                Modification du message
                <button type="button" onClick={() => { setEditId(null); setDraft('') }}>Annuler</button>
              </div>
            )}
            <form
              className="jp-composer"
              onSubmit={submitMessage}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                handleFileSelection(event.dataTransfer.files)
              }}
            >
              {attachments.length > 0 && (
                <div className="jp-attachment-list">
                  {attachments.map((file) => (
                    <div className="jp-attachment" key={file.id}>
                      <FileText size={17} />
                      <span><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(1)} Mo · aperçu local</small></span>
                      <button
                        type="button"
                        onClick={() => setAttachments((current) => current.filter(({ id }) => id !== file.id))}
                        aria-label={`Retirer ${file.name}`}
                      ><X size={15} /></button>
                    </div>
                  ))}
                </div>
              )}
              <label className="sr-only" htmlFor="jp-prompt">Votre question juridique</label>
              <textarea
                id="jp-prompt"
                ref={textareaRef}
                rows={1}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    event.currentTarget.form?.requestSubmit()
                  }
                }}
                placeholder={modeId === 'document' ? 'Joignez un document ou décrivez ce que vous souhaitez examiner…' : 'Posez votre question sur le droit haïtien…'}
                disabled={busy}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILES}
                multiple
                hidden
                onChange={(event) => {
                  handleFileSelection(event.target.files)
                  event.target.value = ''
                }}
              />
              <div className="jp-composer-bottom">
                <div className="jp-composer-tools">
                  <button
                    type="button"
                    className="jp-attach-button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Joindre un fichier"
                    title="Joindre un fichier (PDF, DOCX, TXT, image)"
                  ><Paperclip size={18} /><span>Joindre</span></button>
                  <div className="jp-mode-wrap">
                    <button
                      type="button"
                      className="jp-tool-pill"
                      onClick={() => setModeOpen((open) => !open)}
                      aria-expanded={modeOpen}
                    >{activeMode.label}<ChevronDown size={14} /></button>
                    {modeOpen && (
                      <div className="jp-dropdown jp-mode-dropdown">
                        {MODES.map((mode) => (
                          <button
                            type="button"
                            key={mode.id}
                            className={modeId === mode.id ? 'jp-dropdown-selected' : ''}
                            onClick={() => { setModeId(mode.id); setModeOpen(false) }}
                          >{mode.label}{modeId === mode.id && <Check size={15} />}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type={busy ? 'button' : 'submit'}
                  className="jp-send-button"
                  disabled={!busy && !draft.trim() && !attachments.length}
                  aria-label={busy ? 'Arrêter la génération' : 'Envoyer le message'}
                  title={busy ? 'Arrêter' : 'Envoyer'}
                  onClick={busy ? () => requestControllerRef.current?.abort() : undefined}
                >
                  {busy ? <Square size={15} fill="currentColor" /> : <ArrowUp size={19} />}
                </button>
              </div>
            </form>
            <div className="jp-composer-meta">
              <span>Maj + Entrée pour aller à la ligne</span>
              <span>Fichiers acceptés jusqu’à 20 Mo · non transmis sans service connecté</span>
            </div>
            <p className="jp-disclaimer">
              JuriPredict fournit des informations à titre indicatif, pas un avis juridique professionnel.
            </p>
          </section>
        </div>
      </main>

      {settingsOpen && (
        <div className="jp-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSettingsOpen(false)
        }}>
          <section className="jp-settings-modal" role="dialog" aria-modal="true" aria-labelledby="jp-settings-title">
            <header><div><span className="jp-modal-kicker">VOTRE ESPACE</span><h2 id="jp-settings-title">Paramètres</h2></div>
              <button type="button" className="jp-icon-button" onClick={() => setSettingsOpen(false)} aria-label="Fermer les paramètres"><X size={18} /></button>
            </header>
            <div className="jp-settings-content">
              <fieldset><legend>Général</legend>
                <label>Menu des conversations<select value={settings.sidebarMode ?? 'hover'} onChange={(event) => updateSetting('sidebarMode', event.target.value)}>
                  <option value="hover">Déplier au survol</option><option value="pinned">Toujours ouvert</option>
                </select></label>
                <label>Langue de l’interface<select value={settings.language} onChange={(event) => updateSetting('language', event.target.value)}>
                  <option value="fr">Français</option><option value="ht">Kreyòl ayisyen</option><option value="en">English</option>
                </select></label>
                <label>Apparence<select value={settings.theme} onChange={(event) => updateSetting('theme', event.target.value)}>
                  <option value="light">Claire</option><option value="dark">Sombre</option>
                </select></label>
              </fieldset>
              <fieldset><legend>Personnalisation</legend>
                <label>Langue de réponse<select value={settings.responseLanguage} onChange={(event) => updateSetting('responseLanguage', event.target.value)}>
                  <option value="fr-FR">Français</option><option value="ht-HT">Kreyòl ayisyen</option><option value="en-US">English</option>
                </select></label>
                <label>Style d’explication<select value={settings.style} onChange={(event) => updateSetting('style', event.target.value)}>
                  <option value="accessible">Accessible</option><option value="formal">Juridique et formel</option><option value="concise">Concis</option>
                </select></label>
                <label>Profil<select value={settings.audience} onChange={(event) => updateSetting('audience', event.target.value)}>
                  <option value="general">Grand public</option><option value="student">Étudiant·e</option><option value="professional">Professionnel·le du droit</option>
                </select></label>
              </fieldset>
              <fieldset><legend>Données et notifications</legend>
                <label className="jp-toggle-row">Enregistrer l’historique
                  <input type="checkbox" checked={settings.history} onChange={(event) => updateSetting('history', event.target.checked)} />
                </label>
                <label className="jp-toggle-row">Recevoir les actualités produit
                  <input type="checkbox" checked={settings.updates} onChange={(event) => updateSetting('updates', event.target.checked)} />
                </label>
                <div className="jp-settings-actions">
                  <button type="button" onClick={() => {
                    if (!window.confirm('Supprimer tout l’historique enregistré dans ce navigateur ?')) return
                    setConversations([])
                    setActiveId(null)
                    setSettingsOpen(false)
                  }}><Trash2 size={15} /> Effacer l’historique local</button>
                  <button type="button" onClick={() => {
                    const data = new Blob([JSON.stringify({ conversations, settings }, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(data)
                    const anchor = document.createElement('a')
                    anchor.href = url
                    anchor.download = 'juripredict-export.json'
                    anchor.click()
                    URL.revokeObjectURL(url)
                  }}><ArrowDown size={15} /> Exporter mes données</button>
                </div>
              </fieldset>
              <p className="jp-about-note">JuriPredict · Version prototype. Les paramètres et conversations restent dans ce navigateur. <Link to="/ressources" onClick={() => setSettingsOpen(false)}>Ressources juridiques</Link> · <Link to="/assistant" onClick={() => setSettingsOpen(false)}>Avertissement juridique</Link></p>
            </div>
          </section>
        </div>
      )}

      {shareOpen && activeConversation && (
        <div className="jp-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShareOpen(false)
        }}>
          <section className="jp-share-modal" role="dialog" aria-modal="true" aria-labelledby="jp-share-title">
            <header><div><span className="jp-modal-kicker">PARTAGE PRIVÉ</span><h2 id="jp-share-title">Partager la conversation</h2></div>
              <button type="button" className="jp-icon-button" onClick={() => setShareOpen(false)} aria-label="Fermer"><X size={18} /></button>
            </header>
            <div className="jp-share-message"><ShieldCheck size={20} /><p>Aucun lien public n’est créé. La conversation est enregistrée uniquement sur cet appareil ; la partager via un lien nécessitera un service sécurisé connecté.</p></div>
            <div className="jp-share-actions">
              <button type="button" className="jp-secondary-button" onClick={() => downloadConversation(activeConversation, 'md')}>Exporter en Markdown</button>
              <button type="button" className="jp-secondary-button" onClick={() => downloadConversation(activeConversation, 'txt')}>Exporter en TXT</button>
              <button type="button" className="jp-primary-button" onClick={() => { window.print(); setShareOpen(false) }}>Imprimer</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
