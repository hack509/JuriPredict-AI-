import { useMemo, useState } from 'react'
import { AnalysisContext } from './analysisContext.js'

export function AnalysisProvider({ children }) {
  const [facts, setFacts] = useState('')
  const [result, setResult] = useState(null)
  const value = useMemo(
    () => ({ facts, setFacts, result, setResult }),
    [facts, result],
  )

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  )
}