import { ACHIEVEMENT_DEFS } from './model';
import { dateKey, scoreForDay } from './focusScore';

// XP tied to consistency + Focus Score, not raw hours: a short, clean,
// high-score session should out-earn a long, distraction-heavy one.
export function xpForSession(session, dayFocusScore) {
  if (!session.completed) return 2; // small consolation XP for trying
  const base = 10;
  const scoreBonus = Math.round((dayFocusScore / 100) * 20);
  const distractionPenalty = Math.min(8, session.distractions.length * 2);
  return Math.max(3, base + scoreBonus - distractionPenalty);
}

export function levelForXP(xp) {
  // Level thresholds grow quadratically so early levels come fast.
  let level = 1;
  let remaining = xp;
  let need = 50;
  while (remaining >= need) {
    remaining -= need;
    level += 1;
    need = Math.round(need * 1.35);
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel: need };
}

/** Recompute currentStreak/longestStreak given all sessions, anchored on "today". */
export function computeStreak(sessions, today = new Date()) {
  const days = new Set(sessions.filter((s) => s.completed).map((s) => dateKey(s.startTime)));
  if (days.size === 0) return { currentStreak: 0, longestStreak: 0 };

  let longest = 0;
  let running = 0;
  const sorted = [...days].sort();
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      running = 1;
    } else {
      const prev = new Date(sorted[i - 1]);
      const cur = new Date(sorted[i]);
      const diffDays = Math.round((cur - prev) / 86400000);
      running = diffDays === 1 ? running + 1 : 1;
    }
    longest = Math.max(longest, running);
  }

  // current streak: walk backward from today (or yesterday, so a day still
  // in progress doesn't zero out the streak before it's logged)
  let current = 0;
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);
  if (!days.has(dateKey(cursor.toISOString()))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(dateKey(cursor.toISOString()))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { currentStreak: current, longestStreak: Math.max(longest, current) };
}

/** Evaluate which achievements are newly unlocked given full history. */
export function evaluateAchievements({ sessions, tasks, profile, unlockedKeys, weights }) {
  const unlocked = new Set(unlockedKeys);
  const newly = [];

  const completedSessions = sessions.filter((s) => s.completed);
  const check = (key) => {
    if (!unlocked.has(key)) {
      newly.push(key);
      unlocked.add(key);
    }
  };

  if (completedSessions.length >= 1) check('first-session');
  if (completedSessions.length >= 10) check('ten-sessions');
  if (profile.currentStreak >= 3) check('streak-3');
  if (profile.currentStreak >= 7) check('streak-7');
  if (profile.currentStreak >= 30) check('streak-30');
  if (completedSessions.some((s) => s.distractions.length === 0)) check('zero-distraction');
  if (completedSessions.some((s) => new Date(s.startTime).getHours() < 8)) check('early-bird');
  if (completedSessions.some((s) => new Date(s.startTime).getHours() >= 22)) check('night-owl');
  if (tasks.filter((t) => t.status === 'completed').length >= 20) check('task-master');

  const byDay = new Map();
  for (const s of completedSessions) {
    const key = dateKey(s.startTime);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(s);
  }
  for (const [, daySessions] of byDay) {
    const dayTasks = tasks; // task completion isn't day-scoped in the model; use full set as denominator
    const score = scoreForDay(daySessions, dayTasks, weights);
    if (score >= 90) {
      check('high-score');
      break;
    }
  }

  return { unlockedKeys: [...unlocked], newlyUnlocked: newly.map((k) => ACHIEVEMENT_DEFS.find((a) => a.key === k)) };
}
