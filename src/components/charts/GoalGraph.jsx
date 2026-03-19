import { useState, useRef, useEffect } from 'react'
import { categoryConfig } from '../../data/defaultGoals'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

export default function GoalGraph({ goals }) {
  const svgRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredNode, setHoveredNode] = useState(null)

  const width = 700
  const height = 500
  const centerX = width / 2
  const centerY = height / 2

  const categories = Object.entries(categoryConfig)
  const catRadius = 140

  const nodes = []
  const edges = []

  // Center node
  nodes.push({
    id: 'center',
    label: 'GoalForge',
    x: centerX,
    y: centerY,
    r: 28,
    color: '#6366f1',
    type: 'center'
  })

  // Category nodes arranged in circle
  categories.forEach(([key, config], i) => {
    const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2
    const cx = centerX + catRadius * Math.cos(angle)
    const cy = centerY + catRadius * Math.sin(angle)

    nodes.push({
      id: `cat-${key}`,
      label: config.label,
      x: cx,
      y: cy,
      r: 22,
      color: config.color,
      type: 'category',
      categoryKey: key
    })

    edges.push({ from: 'center', to: `cat-${key}`, color: config.color })

    // Goal nodes for each category
    const catGoals = goals.filter(g => g.category === key)
    const goalRadius = 80
    catGoals.forEach((goal, gi) => {
      const goalAngle = angle + ((gi - (catGoals.length - 1) / 2) * 0.4)
      const gx = cx + goalRadius * Math.cos(goalAngle)
      const gy = cy + goalRadius * Math.sin(goalAngle)

      nodes.push({
        id: goal.id,
        label: goal.title,
        x: gx,
        y: gy,
        r: 14,
        color: config.color,
        type: 'goal',
        progress: goal.progress,
        milestones: goal.milestones
      })

      edges.push({ from: `cat-${key}`, to: goal.id, color: config.color })
    })
  })

  const handleMouseDown = (e) => {
    setDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e) => {
    if (!dragging) return
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const handleMouseUp = () => setDragging(false)

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  useEffect(() => {
    const handleWheel = (e) => {
      if (!svgRef.current?.contains(e.target)) return
      e.preventDefault()
      setZoom(prev => Math.max(0.3, Math.min(3, prev + (e.deltaY > 0 ? -0.1 : 0.1))))
    }
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  const getNodeById = (id) => nodes.find(n => n.id === id)

  return (
    <div className="card p-4 relative">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Goal Map</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="p-1.5 hover:bg-surface-light rounded-lg transition-colors">
            <ZoomIn className="w-3.5 h-3.5 text-text-muted" />
          </button>
          <button onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} className="p-1.5 hover:bg-surface-light rounded-lg transition-colors">
            <ZoomOut className="w-3.5 h-3.5 text-text-muted" />
          </button>
          <button onClick={resetView} className="p-1.5 hover:bg-surface-light rounded-lg transition-colors">
            <Maximize2 className="w-3.5 h-3.5 text-text-muted" />
          </button>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden bg-surface-light border border-surface-border" style={{ height: '360px' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} style={{ transformOrigin: `${width/2}px ${height/2}px` }}>
            {/* Edges */}
            {edges.map((edge, i) => {
              const from = getNodeById(edge.from)
              const to = getNodeById(edge.to)
              if (!from || !to) return null
              return (
                <line
                  key={i}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={edge.color}
                  strokeWidth="1"
                  opacity="0.3"
                />
              )
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isHovered = hoveredNode === node.id
              return (
                <g
                  key={node.id}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Glow */}
                  {isHovered && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.r + 6}
                      fill="none"
                      stroke={node.color}
                      strokeWidth="1"
                      opacity="0.3"
                    />
                  )}

                  {/* Progress ring for goal nodes */}
                  {node.type === 'goal' && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.r + 2}
                      fill="none"
                      stroke={node.color}
                      strokeWidth="2"
                      opacity="0.3"
                      strokeDasharray={`${(node.progress / 100) * 2 * Math.PI * (node.r + 2)} ${2 * Math.PI * (node.r + 2)}`}
                      transform={`rotate(-90, ${node.x}, ${node.y})`}
                    />
                  )}

                  {/* Node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r}
                    fill={`${node.color}20`}
                    stroke={node.color}
                    strokeWidth={isHovered ? 2 : 1}
                  />

                  {/* Label */}
                  <text
                    x={node.x}
                    y={node.type === 'goal' ? node.y - 2 : node.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={node.color}
                    className={node.type === 'center' ? 'text-[10px] font-bold' : node.type === 'category' ? 'text-[7px] font-semibold' : 'text-[5px] font-medium'}
                  >
                    {node.label.length > 14 ? node.label.substring(0, 12) + '..' : node.label}
                  </text>

                  {/* Progress text for goals */}
                  {node.type === 'goal' && (
                    <text
                      x={node.x}
                      y={node.y + 7}
                      textAnchor="middle"
                      className="text-[5px]"
                      fill="#5c5875"
                    >
                      {node.progress}%
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {/* Hover tooltip */}
      {hoveredNode && (() => {
        const node = getNodeById(hoveredNode)
        if (!node || node.type === 'center') return null
        return (
          <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-surface border border-surface-border shadow-xl animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }} />
              <span className="text-xs font-semibold text-text-primary">{node.label}</span>
            </div>
            {node.type === 'goal' && (
              <div className="flex items-center gap-3 text-[10px] text-text-muted">
                <span>Progress: {node.progress}%</span>
                <span>Milestones: {node.milestones?.filter(m => m.completed).length}/{node.milestones?.length}</span>
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}
