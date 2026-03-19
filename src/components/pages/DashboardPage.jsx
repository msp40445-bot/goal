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
    <div className="space-y-4 animate-fade-in">
      <StatsBar goals={goals} tasks={tasks} streak={streak} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Timeline + Radar */}
        <div className="lg:col-span-8 space-y-4">
          <Timeline completionLog={completionLog} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RadarChart goals={goals} />
            <div className="space-y-4">
              <FocusTimer onSessionComplete={() => {
                onAddActivityLog({
                  id: `log-${Date.now()}`,
                  content: 'Completed a focus session',
                  category: 'growth',
                  timestamp: new Date().toISOString()
                })
              }} />
              <StreakBadge streak={streak} />
            </div>
          </div>
        </div>

        {/* Right: Tasks + Whoop + Quote */}
        <div className="lg:col-span-4 space-y-4">
          <TaskList tasks={tasks} onUpdate={onUpdateTasks} />
          <WhoopWidget />
          <MotivationalQuote />
        </div>
      </div>
    </div>
  )
}
