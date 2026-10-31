const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const REQUEST_TIMEOUT = 30_000

export async function sendChatMessage({
  conversationId,
  message,
  mode,
  profile,
  files = [],
  signal,
}) {
  const controller = new AbortController()
  let timedOut = false
  const abortRequest = () => controller.abort()
  if (signal?.aborted) {
    controller.abort()
  } else {
    signal?.addEventListener('abort', abortRequest, { once: true })
  }
  const timeoutId = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, REQUEST_TIMEOUT)

  try {
    const body = files.length
      ? (() => {
          const form = new FormData()
          form.append('conversation_id', conversationId)
          form.append('message', message)
          form.append('mode', mode)
          form.append('profile', profile)
          files.forEach(({ file }) => form.append('files', file))
          return form
        })()
      : JSON.stringify({
          conversation_id: conversationId,
          message,
          mode,
          profile,
        })
    const response = await fetch(`${API_URL}/api/v1/chat`, {
      method: 'POST',
      ...(files.length ? {} : { headers: { 'Content-Type': 'application/json' } }),
      signal: controller.signal,
      body,
    })

    if (!response.ok) {
      throw new Error(
        response.status === 404
          ? 'Le point de terminaison de conversation n’est pas configuré sur le serveur.'
          : `Le service de conversation a répondu avec l’erreur ${response.status}.`,
      )
    }

    const result = await response.json()
    const content =
      typeof result.content === 'string'
        ? result.content
        : typeof result.message?.content === 'string'
          ? result.message.content
          : ''

    if (!content.trim()) {
      throw new Error('Le service n’a retourné aucun contenu de réponse.')
    }

    return {
      id: result.id ?? result.message_id,
      content,
      citations: Array.isArray(result.citations) ? result.citations : [],
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      const abortError = new Error(
        timedOut
          ? 'La requête a expiré après 30 secondes.'
          : 'La requête a été arrêtée.',
      )
      if (!timedOut) abortError.name = 'AbortError'
      throw abortError
    }
    if (error instanceof TypeError) {
      throw new Error('Impossible de joindre le serveur. Vérifiez la connexion et la configuration de l’API.')
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
    signal?.removeEventListener('abort', abortRequest)
  }
}
