import { useContext } from 'react'
import { AnalysisContext } from './analysisContext.js'

export function useAnalysis() {
  const context = useContext(AnalysisContext)
  if (!context) {
    throw new Error('useAnalysis doit être utilisé dans un AnalysisProvider.')
  }
  return context
}
