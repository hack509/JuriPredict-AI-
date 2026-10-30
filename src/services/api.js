import { mockAnalysis, mockArticles } from './mocks.js'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'
const REQUEST_TIMEOUT = 30_000

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function request(path, options = {}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Erreur API ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('La requête a expiré après 30 secondes.')
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function analyzeCase(facts) {
  if (USE_MOCKS) {
    await wait(800)
    const mentionsViolence = /violence|violent/i.test(facts)
    return {
      ...mockAnalysis,
      case_summary: mentionsViolence
        ? `${mockAnalysis.case_summary} Un usage de la violence est également mentionné.`
        : mockAnalysis.case_summary,
      scenarios: mockAnalysis.scenarios.map((scenario, index) =>
        mentionsViolence && index === 1
          ? {
              ...scenario,
              description:
                'La violence est mentionnée dans les faits ; une autre disposition pourrait devenir pertinente et doit être vérifiée dans les sources.',
            }
          : scenario,
      ),
    }
  }

  return request('/api/v1/analyze', {
    method: 'POST',
    body: JSON.stringify({ query: facts }),
  })
}

export async function searchArticles(query) {
  if (USE_MOCKS) {
    await wait(400)
    const normalizedQuery = query.trim().toLocaleLowerCase()
    if (!normalizedQuery) return mockArticles

    return mockArticles.filter((article) =>
      `${article.title} ${article.content} ${article.document_title} ${article.article_number}`
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    )
  }

  return request('/api/v1/search', {
    method: 'POST',
    body: JSON.stringify({ query }),
  })
}

export async function getArticle(id) {
  if (USE_MOCKS) {
    await wait(300)
    return mockArticles.find((article) => article.id === id) ?? null
  }

  return request(`/api/v1/articles/${encodeURIComponent(id)}`)
}

export async function explainText(text) {
  if (USE_MOCKS) {
    await wait(600)
    return {
      explanation:
        "Explication simplifiée générée par l'IA (exemple). Consultez toujours le texte officiel.",
    }
  }

  return request('/api/v1/explain', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}