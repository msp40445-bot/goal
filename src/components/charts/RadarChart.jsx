import { categoryConfig } from '../../data/defaultGoals'

export default function RadarChart({ goals }) {
  const categories = Object.entries(categoryConfig)
  const n = categories.length
  const cx = 150
  const cy = 150
  const maxR = 110

  const categoryData = categories.map(([key, config]) => {
    const catGoals = goals.filter(g => g.category === key)
    const avgProgress = catGoals.length > 0
      ? Math.round(catGoals.reduce((sum, g) => sum + g.progress, 0) / catGoals.length)
      : 0
    return { key, ...config, progress: avgProgress, goalCount: catGoals.length }
  })

  const getPoint = (index, value) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2
    const r = (value / 100) * maxR
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    }
  }

  const gridLevels = [25, 50, 75, 100]

  const dataPoints = categoryData.map((cat, i) => getPoint(i, cat.progress))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Goal Radar</span>
        <span className="text-xs text-text-muted">Category Progress</span>
      </div>

      <div className="flex justify-center">
        <svg viewBox="0 0 300 300" className="w-full max-w-[280px]">
          {/* Grid rings */}
          {gridLevels.map(level => {
            const points = Array.from({ length: n }, (_, i) => getPoint(i, level))
            const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
            return (
              <path
                key={level}
                d={path}
                fill="none"
                stroke="rgba(50, 47, 72, 0.5)"
                strokeWidth="0.5"
              />
            )
          })}

          {/* Axis lines */}
          {categoryData.map((_, i) => {
            const p = getPoint(i, 100)
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={p.x}
                y2={p.y}
                stroke="rgba(50, 47, 72, 0.3)"
                strokeWidth="0.5"
              />
            )
          })}

          {/* Data area */}
          <path
            d={dataPath}
            fill="rgba(99, 102, 241, 0.15)"
            stroke="rgba(99, 102, 241, 0.6)"
            strokeWidth="1.5"
          />

          {/* Data points */}
          {dataPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill={categoryData[i].color}
              stroke="rgba(10, 9, 18, 0.8)"
              strokeWidth="1.5"
            />
          ))}

          {/* Labels */}
          {categoryData.map((cat, i) => {
            const labelPoint = getPoint(i, 125)
            return (
              <g key={cat.key}>
                <text
                  x={labelPoint.x}
                  y={labelPoint.y - 6}
                  textAnchor="middle"
                  className="text-[9px] font-medium"
                  fill={cat.color}
                >
                  {cat.label.split(' ')[0]}
                </text>
                <text
                  x={labelPoint.x}
                  y={labelPoint.y + 6}
                  textAnchor="middle"
                  className="text-[8px]"
                  fill="#5c5875"
                >
                  {cat.progress}%
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {categoryData.map(cat => (
          <div key={cat.key} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
            <div className="min-w-0">
              <div className="text-xs text-text-primary font-medium truncate">{cat.label}</div>
              <div className="text-[10px] text-text-muted">{cat.goalCount} goals - {cat.progress}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
