import StatsBar from '../StatsBar'
import Timeline from '../Timeline'
import RadarChart from '../charts/RadarChart'
import TaskList from '../TaskList'
import FocusTimer from '../FocusTimer'
import StreakBadge from '../StreakBadge'
import MotivationalQuote from '../MotivationalQuote'
import WhoopWidget from '../WhoopWidget'

export default function DashboardPage({ goals, tasks, streak, completionLog, onUpdateTasks, onAddActivityLog }) {
  return (
    <div className="space-y-3 animate-fade-in">
      <StatsBar goals={goals} tasks={tasks} streak={streak} />
      <Timeline completionLog={completionLog} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left: Radar + Focus */}
        <div className="space-y-3">
          <RadarChart goals={goals} />
          <FocusTimer onSessionComplete={() => {
            onAddActivityLog({
              id: `log-${Date.now()}`,
              content: 'Completed a focus session',
              category: 'growth',
              timestamp: new Date().toISOString()
            })
          }} />
        </div>

        {/* Center: Tasks */}
        <div>
          <TaskList tasks={tasks} onUpdate={onUpdateTasks} />
        </div>

        {/* Right: Health + Streak + Quote */}
        <div className="space-y-3">
          <WhoopWidget />
          <StreakBadge streak={streak} />
          <MotivationalQuote />
        </div>
      </div>
    </div>
  )
}
