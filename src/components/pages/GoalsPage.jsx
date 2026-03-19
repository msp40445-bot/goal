import { useState } from 'react'
import { Plus, Grid3X3, Network } from 'lucide-react'
import GoalCard from '../GoalCard'
import GoalGraph from '../charts/GoalGraph'
import RadarChart from '../charts/RadarChart'
import { categoryConfig } from '../../data/defaultGoals'

export default function GoalsPage({ goals, onUpdate, onDelete, onAIBreakdown, onAddGoal }) {
  const [view, setView] = useState('cards')
  const [filterCategory, setFilterCategory] = useState('all')

  const goalsByCategory = Object.keys(categoryConfig).reduce((acc, cat) => {
    acc[cat] = goals.filter(g => g.category === cat)
    return acc
  }, {})

  const filteredGoals = filterCategory === 'all' ? goals : goals.filter(g => g.category === filterCategory)

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-text-primary">Goals</h2>
          <p className="text-xs text-text-muted">{goals.length} active across {Object.keys(categoryConfig).length} categories</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-surface-light rounded-lg p-0.5 border border-surface-border">
            <button
              onClick={() => setView('cards')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === 'cards' ? 'bg-primary/20 text-primary-light' : 'text-text-muted hover:text-text-secondary'}`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView('graph')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === 'graph' ? 'bg-primary/20 text-primary-light' : 'text-text-muted hover:text-text-secondary'}`}
            >
              <Network className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={onAddGoal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-xs font-semibold transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Plus className="w-3.5 h-3.5" /> New Goal
          </button>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            filterCategory === 'all' ? 'bg-primary/20 text-primary-light border-primary/30' : 'bg-surface text-text-muted border-surface-border hover:text-text-secondary'
          }`}
        >
          All ({goals.length})
        </button>
        {Object.entries(categoryConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilterCategory(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filterCategory === key ? 'text-white border-transparent' : 'bg-surface text-text-muted border-surface-border hover:text-text-secondary'
            }`}
            style={filterCategory === key ? { backgroundColor: config.color } : {}}
          >
            {config.label} ({goalsByCategory[key]?.length || 0})
          </button>
        ))}
      </div>

      {view === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Goal cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onAIBreakdown={onAIBreakdown}
                />
              ))}
              {filteredGoals.length === 0 && (
                <div className="col-span-2 card p-8 text-center">
                  <p className="text-sm text-text-muted">No goals in this category yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Radar sidebar */}
          <div>
            <RadarChart goals={goals} />
          </div>
        </div>
      ) : (
        <GoalGraph goals={goals} />
      )}
    </div>
  )
}
