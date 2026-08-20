// Focus Score engine — spec formula (Section 7), weights configurable.
//   FocusScore = clamp(
//     tasksCompletedRatio    * wTasks +
//     sessionCompletionRatio * wSession +
//     max(0, 1 - distractionsPerHour / 5) * wDistraction,
//   0, 100)

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/**
 * @param {object} params
 * @param {number} params.tasksCompletedRatio 0..1
 * @param {number} params.sessionCompletionRatio 0..1
 * @param {number} params.distractionsPerHour >= 0
 * @param {{tasks:number, sessionCompletion:number, distraction:number}} params.weights
 */
export function computeFocusScore({ tasksCompletedRatio, sessionCompletionRatio, distractionsPerHour, weights }) {
  const w = weights ?? { tasks: 0.4, sessionCompletion: 0.3, distraction: 0.3 };
  const distractionTerm = Math.max(0, 1 - distractionsPerHour / 5);
  const raw =
    tasksCompletedRatio * w.tasks +
    sessionCompletionRatio * w.sessionCompletion +
    distractionTerm * w.distraction;
  return Math.round(clamp(raw * 100, 0, 100));
}

/** Aggregate a set of sessions + tasks (already filtered to one day) into a Focus Score. */
export function scoreForDay(sessions, tasks, weights) {
  if (sessions.length === 0) return 0;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const tasksCompletedRatio = totalTasks > 0 ? completedTasks / totalTasks : 0;

  const completedSessions = sessions.filter((s) => s.completed).length;
  const sessionCompletionRatio = sessions.length > 0 ? completedSessions / sessions.length : 0;

  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const totalHours = totalSeconds / 3600;
  const totalDistractions = sessions.reduce((sum, s) => sum + s.distractions.length, 0);
  const distractionsPerHour = totalHours > 0 ? totalDistractions / totalHours : totalDistractions > 0 ? totalDistractions : 0;

  return computeFocusScore({ tasksCompletedRatio, sessionCompletionRatio, distractionsPerHour, weights });
}

export function dateKey(isoString) {
  return isoString.slice(0, 10); // YYYY-MM-DD
}

export function groupByDay(sessions) {
  const map = new Map();
  for (const s of sessions) {
    const key = dateKey(s.startTime);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return map;
}

/** Rule-based insights derived from session/task history. At least one is guaranteed when there's data. */
export function generateInsights({ sessions, tasks, focusScoreToday }) {
  const insights = [];
  if (sessions.length === 0) {
    return ["You haven't logged a session yet — start a timer to begin charting your sky."];
  }

  // Rule: focus tends to drop after long uninterrupted stretches
  const longSessions = sessions.filter((s) => s.durationSeconds > 45 * 60);
  const longSessionsWithDistraction = longSessions.filter((s) => s.distractions.length > 0);
  if (longSessions.length >= 2 && longSessionsWithDistraction.length / longSessions.length > 0.5) {
    insights.push('Your focus tends to drop after ~45 minutes — try a shorter session or build in a break.');
  }

  // Rule: distraction category clustering
  const distractionCounts = {};
  for (const s of sessions) {
    for (const d of s.distractions) {
      distractionCounts[d.type] = (distractionCounts[d.type] || 0) + 1;
    }
  }
  const topType = Object.entries(distractionCounts).sort((a, b) => b[1] - a[1])[0];
  if (topType && topType[1] >= 3) {
    insights.push(`"${topType[0]}" is your most common distraction — consider silencing it before your next session.`);
  }

  // Rule: time-of-day pattern
  const hourBuckets = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  for (const s of sessions) {
    const h = new Date(s.startTime).getHours();
    if (h < 6) hourBuckets.night++;
    else if (h < 12) hourBuckets.morning++;
    else if (h < 18) hourBuckets.afternoon++;
    else hourBuckets.evening++;
  }
  const bestBucket = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0];
  if (bestBucket && bestBucket[1] >= 3) {
    insights.push(`Most of your sessions happen in the ${bestBucket[0]} — that's likely your strongest study window.`);
  }

  // Rule: incomplete sessions
  const incompleteRatio = sessions.filter((s) => !s.completed).length / sessions.length;
  if (incompleteRatio > 0.4) {
    insights.push("You're abandoning a lot of sessions before the timer ends — try a shorter default duration.");
  }

  // Rule: score trend nudge
  if (focusScoreToday != null) {
    if (focusScoreToday >= 80) insights.push('Strong Focus Score today — this is a good rhythm to repeat tomorrow.');
    else if (focusScoreToday < 40) insights.push('Lower Focus Score today — fewer distractions or shorter sessions may help.');
  }

  if (insights.length === 0) {
    insights.push('Keep logging sessions — patterns will surface here as your history grows.');
  }
  return insights;
}
