export function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function sessionsToCSV(sessions) {
  const header = ['id', 'taskId', 'startTime', 'endTime', 'durationSeconds', 'distractionCount', 'breaksTaken', 'breaksSkipped', 'completed'];
  const rows = sessions.map((s) => [
    s.id,
    s.taskId ?? '',
    s.startTime,
    s.endTime ?? '',
    s.durationSeconds,
    s.distractions.length,
    s.breaksTaken,
    s.breaksSkipped,
    s.completed,
  ]);
  const escape = (v) => {
    const str = String(v);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  return [header, ...rows].map((r) => r.map(escape).join(',')).join('\n');
}

export function exportProfileBundle({ profile, tasks, sessions, achievements, settings }) {
  return JSON.stringify(
    { version: 1, exportedAt: new Date().toISOString(), profile, tasks, sessions, achievements, settings },
    null,
    2
  );
}

export function parseProfileBundle(jsonText) {
  const data = JSON.parse(jsonText);
  if (!data || typeof data !== 'object' || !data.profile || !data.profile.displayName) {
    throw new Error('That file does not look like a FocusFlow profile export.');
  }
  return data;
}
