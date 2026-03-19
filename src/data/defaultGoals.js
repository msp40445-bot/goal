export const defaultGoals = [
  {
    id: 'goal-1',
    title: 'AI & Robotics Lab',
    description: 'Build a comprehensive AI lab focused on electronics, mechatronics, robotics, weapon systems, and design systems. Master hardware-software integration.',
    category: 'tech',
    progress: 0,
    startDate: new Date().toISOString(),
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [
      { id: 'm1', title: 'Set up electronics workbench & tools', completed: false },
      { id: 'm2', title: 'Complete Arduino/RPi fundamentals', completed: false },
      { id: 'm3', title: 'Build first robot prototype', completed: false },
      { id: 'm4', title: 'Design & build custom PCB', completed: false },
      { id: 'm5', title: 'Integrate AI with hardware system', completed: false },
      { id: 'm6', title: 'Complete mechatronics project', completed: false },
      { id: 'm7', title: 'Build autonomous system', completed: false },
    ]
  },
  {
    id: 'goal-2',
    title: 'Electronics & Hardware Mastery',
    description: 'Deep dive into circuit design, PCB layout, embedded systems, sensor integration, and hardware prototyping.',
    category: 'tech',
    progress: 0,
    startDate: new Date().toISOString(),
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [
      { id: 'm1', title: 'Master basic circuit analysis', completed: false },
      { id: 'm2', title: 'Learn PCB design (KiCad/Eagle)', completed: false },
      { id: 'm3', title: 'Build sensor array project', completed: false },
      { id: 'm4', title: 'Design power management system', completed: false },
      { id: 'm5', title: 'Complete embedded systems project', completed: false },
    ]
  },
  {
    id: 'goal-3',
    title: 'Sciences & Mathematics',
    description: 'Study chemistry, biology, physics, and advanced mathematics to build a strong scientific foundation.',
    category: 'study',
    progress: 0,
    startDate: new Date().toISOString(),
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [
      { id: 'm1', title: 'Complete calculus review', completed: false },
      { id: 'm2', title: 'Study linear algebra fundamentals', completed: false },
      { id: 'm3', title: 'Physics: mechanics & electromagnetism', completed: false },
      { id: 'm4', title: 'Chemistry: organic & inorganic basics', completed: false },
      { id: 'm5', title: 'Biology: cell biology & genetics', completed: false },
      { id: 'm6', title: 'Statistics & probability', completed: false },
    ]
  },
  {
    id: 'goal-4',
    title: 'Islamic Growth & Spirituality',
    description: 'Strengthen connection with Allah SWT. Improve Quran recitation, study Hadith, maintain prayers, and grow spiritually.',
    category: 'islam',
    progress: 0,
    startDate: new Date().toISOString(),
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [
      { id: 'm1', title: 'Establish 5 daily prayers consistently', completed: false },
      { id: 'm2', title: 'Complete Quran reading schedule', completed: false },
      { id: 'm3', title: 'Study Hadith collection weekly', completed: false },
      { id: 'm4', title: 'Learn Arabic (Quranic)', completed: false },
      { id: 'm5', title: 'Attend weekly Islamic lectures', completed: false },
      { id: 'm6', title: 'Practice daily dhikr & dua', completed: false },
    ]
  },
  {
    id: 'goal-5',
    title: 'Mind, Body & Soul',
    description: 'Physical fitness, mental clarity, and spiritual well-being. Become the best version of yourself.',
    category: 'growth',
    progress: 0,
    startDate: new Date().toISOString(),
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [
      { id: 'm1', title: 'Establish daily workout routine', completed: false },
      { id: 'm2', title: 'Meditation/reflection practice', completed: false },
      { id: 'm3', title: 'Clean diet & nutrition plan', completed: false },
      { id: 'm4', title: 'Read 1 book per month', completed: false },
      { id: 'm5', title: 'Journaling habit', completed: false },
      { id: 'm6', title: 'Sleep schedule optimization', completed: false },
    ]
  },
  {
    id: 'goal-6',
    title: 'Family & Character',
    description: 'Become a better Muslim, future husband, father, sibling, and son. Build strong family relationships and exemplary character.',
    category: 'growth',
    progress: 0,
    startDate: new Date().toISOString(),
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [
      { id: 'm1', title: 'Weekly family quality time', completed: false },
      { id: 'm2', title: 'Practice patience & gratitude daily', completed: false },
      { id: 'm3', title: 'Financial planning & savings', completed: false },
      { id: 'm4', title: 'Learn conflict resolution skills', completed: false },
      { id: 'm5', title: 'Develop leadership qualities', completed: false },
      { id: 'm6', title: 'Community service & volunteering', completed: false },
    ]
  }
]

export const defaultTasks = [
  { id: 't1', title: 'Fajr prayer', category: 'islam', completed: false, recurring: true, priority: 'high' },
  { id: 't2', title: 'Dhuhr prayer', category: 'islam', completed: false, recurring: true, priority: 'high' },
  { id: 't3', title: 'Asr prayer', category: 'islam', completed: false, recurring: true, priority: 'high' },
  { id: 't4', title: 'Maghrib prayer', category: 'islam', completed: false, recurring: true, priority: 'high' },
  { id: 't5', title: 'Isha prayer', category: 'islam', completed: false, recurring: true, priority: 'high' },
  { id: 't6', title: 'Quran recitation (30 min)', category: 'islam', completed: false, recurring: true, priority: 'high' },
  { id: 't7', title: 'Morning workout (45 min)', category: 'growth', completed: false, recurring: true, priority: 'medium' },
  { id: 't8', title: 'Study session - Math/Physics (1 hr)', category: 'study', completed: false, recurring: true, priority: 'medium' },
  { id: 't9', title: 'Electronics/Robotics lab work (2 hrs)', category: 'tech', completed: false, recurring: true, priority: 'medium' },
  { id: 't10', title: 'Read & reflect (30 min)', category: 'growth', completed: false, recurring: true, priority: 'low' },
  { id: 't11', title: 'Evening dhikr & dua', category: 'islam', completed: false, recurring: true, priority: 'high' },
  { id: 't12', title: 'Journal & plan tomorrow', category: 'growth', completed: false, recurring: true, priority: 'low' },
]

export const categoryConfig = {
  tech: { label: 'Tech & Hardware', color: '#3b82f6', icon: 'Cpu' },
  study: { label: 'Sciences & Math', color: '#f59e0b', icon: 'BookOpen' },
  islam: { label: 'Islam & Spirituality', color: '#10b981', icon: 'Moon' },
  growth: { label: 'Growth & Character', color: '#ec4899', icon: 'Heart' },
}
