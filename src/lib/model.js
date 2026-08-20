export function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function defaultProfile(displayName) {
  return {
    displayName,
    xp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null, // ISO date string, used for streak bookkeeping
    createdAt: new Date().toISOString(),
  };
}

export function defaultSettings() {
  return {
    focusScoreWeights: { tasks: 0.4, sessionCompletion: 0.3, distraction: 0.3 },
    dailyGoalMinutes: 90,
    weeklyGoalMinutes: 450,
    soundscape: 'none', // 'none' | 'rain' | 'white-noise' | 'lofi'
    notificationsEnabled: false,
    themeIntensity: 'normal', // 'normal' | 'light'
    pomodoroFocusMinutes: 25,
    pomodoroBreakMinutes: 5,
  };
}

export const DISTRACTION_TYPES = ['phone', 'noise', 'social media', 'other'];

export const ACHIEVEMENT_DEFS = [
  { key: 'first-session', name: 'First Light', description: 'Complete your first focus session.' },
  { key: 'streak-3', name: '3-Day Streak', description: 'Study three days in a row.' },
  { key: 'streak-7', name: '7-Day Streak', description: 'Study seven days in a row.' },
  { key: 'streak-30', name: '30-Day Streak', description: 'Study thirty days in a row.' },
  { key: 'zero-distraction', name: 'Zero-Distraction Session', description: 'Finish a session with no distractions logged.' },
  { key: 'early-bird', name: 'Early Bird', description: 'Start a session before 8am.' },
  { key: 'night-owl', name: 'Night Owl', description: 'Start a session after 10pm.' },
  { key: 'ten-sessions', name: 'Ten Charted', description: 'Complete ten focus sessions.' },
  { key: 'high-score', name: 'Clear Sky', description: 'Reach a Focus Score of 90 or higher.' },
  { key: 'task-master', name: 'Task Master', description: 'Complete twenty tasks.' },
];

export function newTask({ title, estimatedDuration = null, priority = 'normal', tags = [] }) {
  return {
    id: makeId(),
    title,
    estimatedDuration,
    status: 'pending',
    priority,
    tags,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
}

export function newSession({ taskId = null }) {
  return {
    id: makeId(),
    taskId,
    startTime: new Date().toISOString(),
    endTime: null,
    durationSeconds: 0,
    distractions: [],
    breaksTaken: 0,
    breaksSkipped: 0,
    completed: false,
  };
}
