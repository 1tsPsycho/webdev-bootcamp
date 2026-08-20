import { useRef, useState } from 'react';
import { useAppData } from '../state/AppDataContext';
import { Panel, PanelHeading } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Slider } from '../components/ui/Slider';
import { useNotifications } from '../hooks/useNotifications';
import { exportProfileBundle, parseProfileBundle, downloadFile } from '../lib/exportImport';
import { computeFocusScore } from '../lib/focusScore';

function rebalance(weights, key, value) {
  const others = Object.keys(weights).filter((k) => k !== key);
  const remaining = Math.max(0, 1 - value);
  const otherSum = others.reduce((s, k) => s + weights[k], 0) || 1;
  const next = { ...weights, [key]: value };
  for (const k of others) {
    next[k] = remaining * (weights[k] / otherSum);
  }
  return next;
}

export default function Settings() {
  const { profile, profileNames, settings, updateSettings, tasks, sessions, achievements, replaceAll, createProfile, switchProfile } =
    useAppData();
  const { supported, permission, requestPermission } = useNotifications();
  const fileInputRef = useRef(null);
  const [importError, setImportError] = useState(null);
  const [importOk, setImportOk] = useState(false);

  const weights = settings.focusScoreWeights;
  const previewScore = computeFocusScore({
    tasksCompletedRatio: 0.7,
    sessionCompletionRatio: 0.8,
    distractionsPerHour: 2,
    weights,
  });

  const setWeight = (key, value) => updateSettings({ focusScoreWeights: rebalance(weights, key, value) });

  const handleExport = () => {
    const json = exportProfileBundle({ profile, tasks, sessions, achievements, settings });
    downloadFile(`focusflow-${profile.displayName}.json`, json, 'application/json');
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportOk(false);
    try {
      const text = await file.text();
      const bundle = parseProfileBundle(text);
      replaceAll(bundle);
      setImportOk(true);
    } catch (err) {
      setImportError(err.message);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <p className="font-body text-xs tracking-[0.18em] uppercase text-muted mb-1">Settings</p>
        <h1 className="font-display text-4xl text-parchment">Instrument Calibration</h1>
      </div>

      <Panel>
        <PanelHeading eyebrow="Focus Score" title="Weighting" />
        <p className="text-sm text-muted mb-5">
          Adjust how much each factor counts toward your Focus Score. They always sum to 100% — moving one slider rebalances the
          others.
        </p>
        <div className="space-y-5">
          <Slider
            label="Tasks completed"
            value={weights.tasks}
            onChange={(v) => setWeight('tasks', v)}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
          <Slider
            label="Session completion"
            value={weights.sessionCompletion}
            onChange={(v) => setWeight('sessionCompletion', v)}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
          <Slider
            label="Low distractions"
            value={weights.distraction}
            onChange={(v) => setWeight('distraction', v)}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
        </div>
        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-sm text-muted">Preview (70% tasks, 80% sessions, 2 distractions/hr)</span>
          <span className="font-data text-2xl text-gold">{previewScore}</span>
        </div>
      </Panel>

      <Panel tone="maroon">
        <PanelHeading eyebrow="Goals" title="Daily & Weekly" />
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-parchment block mb-1.5">Daily goal (minutes)</span>
            <input
              type="number"
              min="5"
              value={settings.dailyGoalMinutes}
              onChange={(e) => updateSettings({ dailyGoalMinutes: Number(e.target.value) })}
              className="w-full bg-ink border border-border focus:border-gold px-3 py-2 font-data text-parchment outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm text-parchment block mb-1.5">Weekly goal (minutes)</span>
            <input
              type="number"
              min="30"
              value={settings.weeklyGoalMinutes}
              onChange={(e) => updateSettings({ weeklyGoalMinutes: Number(e.target.value) })}
              className="w-full bg-ink border border-border focus:border-gold px-3 py-2 font-data text-parchment outline-none"
            />
          </label>
        </div>
      </Panel>

      <Panel>
        <PanelHeading eyebrow="Session" title="Timer & Sound" />
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-parchment block mb-1.5">Pomodoro focus (min)</span>
            <input
              type="number"
              min="5"
              value={settings.pomodoroFocusMinutes}
              onChange={(e) => updateSettings({ pomodoroFocusMinutes: Number(e.target.value) })}
              className="w-full bg-ink border border-border focus:border-gold px-3 py-2 font-data text-parchment outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm text-parchment block mb-1.5">Pomodoro break (min)</span>
            <input
              type="number"
              min="1"
              value={settings.pomodoroBreakMinutes}
              onChange={(e) => updateSettings({ pomodoroBreakMinutes: Number(e.target.value) })}
              className="w-full bg-ink border border-border focus:border-gold px-3 py-2 font-data text-parchment outline-none"
            />
          </label>
        </div>
        <label className="block mt-4">
          <span className="text-sm text-parchment block mb-1.5">Ambient soundscape</span>
          <select
            value={settings.soundscape}
            onChange={(e) => updateSettings({ soundscape: e.target.value })}
            className="w-full bg-ink border border-border focus:border-gold px-3 py-2 text-parchment font-body outline-none"
          >
            <option value="none">None</option>
            <option value="rain">Rain</option>
            <option value="white-noise">White noise</option>
            <option value="lofi">Lo-fi (synthesized)</option>
          </select>
        </label>
      </Panel>

      <Panel tone="maroon">
        <PanelHeading eyebrow="Notifications" title="Break & Goal Reminders" />
        {!supported ? (
          <p className="text-sm text-muted">Notifications aren't supported in this browser.</p>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              Status: <span className="text-parchment capitalize">{permission}</span>
            </p>
            <Button
              variant="ghost"
              disabled={permission === 'granted'}
              onClick={async () => {
                const result = await requestPermission();
                updateSettings({ notificationsEnabled: result === 'granted' });
              }}
            >
              {permission === 'granted' ? 'Enabled' : 'Enable notifications'}
            </Button>
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeading eyebrow="Appearance" title="Theme Intensity" />
        <div className="flex gap-3">
          {['normal', 'light'].map((intensity) => (
            <button
              key={intensity}
              onClick={() => {
                updateSettings({ themeIntensity: intensity });
                document.documentElement.setAttribute('data-intensity', intensity);
              }}
              className={`px-4 py-2 text-sm capitalize border transition-colors cursor-pointer ${
                settings.themeIntensity === intensity ? 'border-gold text-gold' : 'border-border text-muted'
              }`}
            >
              {intensity === 'normal' ? 'Night (default)' : 'Parchment (light)'}
            </button>
          ))}
        </div>
      </Panel>

      <Panel tone="maroon">
        <PanelHeading eyebrow="Profile" title="Local Profiles" />
        <div className="flex flex-wrap gap-2 mb-4">
          {profileNames.map((n) => (
            <button
              key={n}
              onClick={() => switchProfile(n)}
              className={`px-3 py-1.5 text-sm border transition-colors cursor-pointer ${
                n === profile.displayName ? 'border-gold text-gold' : 'border-border text-muted hover:text-parchment'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const name = e.target.elements.newProfile.value.trim();
            if (name) createProfile(name);
            e.target.reset();
          }}
          className="flex gap-2"
        >
          <input
            name="newProfile"
            placeholder="Add another profile"
            className="flex-1 bg-ink border border-border focus:border-gold px-3 py-2 text-parchment font-body outline-none"
          />
          <Button type="submit" variant="ghost" size="sm">
            Add
          </Button>
        </form>
      </Panel>

      <Panel>
        <PanelHeading eyebrow="Data" title="Export & Import" />
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" onClick={handleExport}>
            Export profile (JSON)
          </Button>
          <Button variant="ghost" onClick={() => fileInputRef.current?.click()}>
            Import profile (JSON)
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
        </div>
        {importError && <p className="text-sm text-danger mt-3">{importError}</p>}
        {importOk && <p className="text-sm text-success mt-3">Profile imported.</p>}
        <p className="text-xs text-muted mt-3">
          This is the frontend-only stand-in for syncing across devices — export here, import on the other device's browser.
        </p>
      </Panel>
    </div>
  );
}
