import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { keys, readJSON, writeJSON, listProfileNames, saveProfileNames } from '../lib/storage';
import { defaultProfile, defaultSettings, newTask, newSession } from '../lib/model';
import { computeStreak, evaluateAchievements, xpForSession, levelForXP } from '../lib/gamification';
import { dateKey, scoreForDay } from '../lib/focusScore';

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [profileNames, setProfileNames] = useState(() => listProfileNames());
  const [activeName, setActiveName] = useState(() => readJSON(keys.activeProfile, null));

  const [profile, setProfile] = useState(() => (activeName ? readJSON(keys.profile(activeName), null) : null));
  const [tasks, setTasks] = useState(() => (activeName ? readJSON(keys.tasks(activeName), []) : []));
  const [sessions, setSessions] = useState(() => (activeName ? readJSON(keys.sessions(activeName), []) : []));
  const [achievements, setAchievements] = useState(() => (activeName ? readJSON(keys.achievements(activeName), []) : []));
  const [settings, setSettings] = useState(() => (activeName ? readJSON(keys.settings(activeName), defaultSettings()) : defaultSettings()));

  // reload all domain state whenever the active profile changes
  useEffect(() => {
    if (!activeName) return;
    setProfile(readJSON(keys.profile(activeName), defaultProfile(activeName)));
    setTasks(readJSON(keys.tasks(activeName), []));
    setSessions(readJSON(keys.sessions(activeName), []));
    setAchievements(readJSON(keys.achievements(activeName), []));
    setSettings(readJSON(keys.settings(activeName), defaultSettings()));
    writeJSON(keys.activeProfile, activeName);
  }, [activeName]);

  useEffect(() => {
    if (activeName && profile) writeJSON(keys.profile(activeName), profile);
  }, [activeName, profile]);
  useEffect(() => {
    if (activeName) writeJSON(keys.tasks(activeName), tasks);
  }, [activeName, tasks]);
  useEffect(() => {
    if (activeName) writeJSON(keys.sessions(activeName), sessions);
  }, [activeName, sessions]);
  useEffect(() => {
    if (activeName) writeJSON(keys.achievements(activeName), achievements);
  }, [activeName, achievements]);
  useEffect(() => {
    if (activeName) writeJSON(keys.settings(activeName), settings);
  }, [activeName, settings]);

  const createProfile = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const names = listProfileNames();
    if (!names.includes(trimmed)) {
      const nextNames = [...names, trimmed];
      saveProfileNames(nextNames);
      setProfileNames(nextNames);
      writeJSON(keys.profile(trimmed), defaultProfile(trimmed));
      writeJSON(keys.tasks(trimmed), []);
      writeJSON(keys.sessions(trimmed), []);
      writeJSON(keys.achievements(trimmed), []);
      writeJSON(keys.settings(trimmed), defaultSettings());
    }
    setActiveName(trimmed);
  }, []);

  const switchProfile = useCallback((name) => setActiveName(name), []);

  // ---- tasks ----
  const addTask = useCallback((input) => setTasks((prev) => [newTask(input), ...prev]), []);
  const updateTask = useCallback((id, patch) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))), []);
  const deleteTask = useCallback((id) => setTasks((prev) => prev.filter((t) => t.id !== id)), []);
  const toggleTaskComplete = useCallback(
    (id) =>
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                status: t.status === 'completed' ? 'pending' : 'completed',
                completedAt: t.status === 'completed' ? null : new Date().toISOString(),
              }
            : t
        )
      ),
    []
  );

  // ---- sessions ----
  /** Commit a finished/abandoned session: records it, updates streak/xp/level/achievements. */
  const commitSession = useCallback(
    (sessionDraft) => {
      setSessions((prevSessions) => {
        const nextSessions = [sessionDraft, ...prevSessions];

        setProfile((prevProfile) => {
          if (!prevProfile) return prevProfile;
          const { currentStreak, longestStreak } = computeStreak(nextSessions);
          const todayKey = dateKey(sessionDraft.startTime);
          const todaySessions = nextSessions.filter((s) => dateKey(s.startTime) === todayKey);
          const dayScore = scoreForDay(todaySessions, tasks, settings.focusScoreWeights);
          const gainedXp = xpForSession(sessionDraft, dayScore);
          const nextXp = prevProfile.xp + gainedXp;
          const { level } = levelForXP(nextXp);

          const nextProfile = {
            ...prevProfile,
            xp: nextXp,
            level,
            currentStreak,
            longestStreak: Math.max(longestStreak, prevProfile.longestStreak || 0),
            lastStudyDate: sessionDraft.completed ? todayKey : prevProfile.lastStudyDate,
          };

          setAchievements((prevAch) => {
            const { unlockedKeys, newlyUnlocked } = evaluateAchievements({
              sessions: nextSessions,
              tasks,
              profile: nextProfile,
              unlockedKeys: prevAch.map((a) => a.badgeKey),
              weights: settings.focusScoreWeights,
            });
            if (newlyUnlocked.length === 0) return prevAch;
            const additions = newlyUnlocked
              .filter(Boolean)
              .map((a) => ({ badgeKey: a.key, unlockedAt: new Date().toISOString() }));
            return [...prevAch, ...additions];
          });

          return nextProfile;
        });

        return nextSessions;
      });
    },
    [tasks, settings.focusScoreWeights]
  );

  // ---- settings ----
  const updateSettings = useCallback((patch) => setSettings((prev) => ({ ...prev, ...patch })), []);
  const updateWeights = useCallback(
    (weights) => setSettings((prev) => ({ ...prev, focusScoreWeights: { ...prev.focusScoreWeights, ...weights } })),
    []
  );

  const replaceAll = useCallback((bundle) => {
    if (bundle.profile) setProfile(bundle.profile);
    if (bundle.tasks) setTasks(bundle.tasks);
    if (bundle.sessions) setSessions(bundle.sessions);
    if (bundle.achievements) setAchievements(bundle.achievements);
    if (bundle.settings) setSettings(bundle.settings);
  }, []);

  const value = useMemo(
    () => ({
      profileNames,
      activeName,
      profile,
      tasks,
      sessions,
      achievements,
      settings,
      createProfile,
      switchProfile,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskComplete,
      commitSession,
      updateSettings,
      updateWeights,
      replaceAll,
    }),
    [
      profileNames,
      activeName,
      profile,
      tasks,
      sessions,
      achievements,
      settings,
      createProfile,
      switchProfile,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskComplete,
      commitSession,
      updateSettings,
      updateWeights,
      replaceAll,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}

export { newSession };
