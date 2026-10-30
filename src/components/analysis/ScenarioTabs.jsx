import { useState } from 'react'

export default function ScenarioTabs({ scenarios = [] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (scenarios.length === 0) return null

  const selectedIndex = Math.min(activeIndex, scenarios.length - 1)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div
        role="tablist"
        aria-label="Scénarios d'analyse"
        className="flex flex-wrap gap-1 border-b border-slate-200 px-3 pt-3"
      >
        {scenarios.map((scenario, index) => (
          <button
            key={`${scenario.title}-${index}`}
            id={`scenario-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={selectedIndex === index}
            aria-controls="scenario-panel"
            onClick={() => setActiveIndex(index)}
            className={`rounded-t-lg px-4 py-2 text-sm transition ${
              selectedIndex === index
                ? 'border-b-2 border-brand font-semibold text-brand'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {scenario.title}
          </button>
        ))}
      </div>
      <p
        id="scenario-panel"
        role="tabpanel"
        aria-labelledby={`scenario-tab-${selectedIndex}`}
        className="min-h-24 p-5 text-sm leading-6 text-slate-700"
      >
        {scenarios[selectedIndex].description}
      </p>
    </div>
  )
}
