import { useState } from 'react';
import { useAppData } from '../state/AppDataContext';
import { Panel, PanelHeading } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { CheckIcon, QuillIcon } from '../components/ui/Icons';
import { formatMinutes } from '../lib/time';

const PRIORITIES = ['low', 'normal', 'high'];

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskComplete } = useAppData();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [priority, setPriority] = useState('normal');
  const [filter, setFilter] = useState('pending');

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({ title: title.trim(), estimatedDuration: duration ? Number(duration) : null, priority });
    setTitle('');
    setDuration('');
    setPriority('normal');
  };

  const visible = tasks.filter((t) => (filter === 'all' ? true : t.status === filter));

  return (
    <div className="space-y-8">
      <div>
        <p className="font-body text-xs tracking-[0.18em] uppercase text-muted mb-1">Task Manager</p>
        <h1 className="font-display text-4xl text-parchment">Your Study Ledger</h1>
      </div>

      <Panel tone="maroon">
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you working on?"
            className="flex-1 bg-ink border border-border focus:border-gold px-4 py-2.5 text-parchment font-body outline-none"
          />
          <input
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Est. min"
            className="w-full sm:w-28 bg-ink border border-border focus:border-gold px-4 py-2.5 text-parchment font-data outline-none"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="bg-ink border border-border focus:border-gold px-4 py-2.5 text-parchment font-body outline-none capitalize"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p} className="capitalize">
                {p}
              </option>
            ))}
          </select>
          <Button type="submit" variant="gold">
            Add Task
          </Button>
        </form>
      </Panel>

      <div className="flex gap-2">
        {['pending', 'completed', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm capitalize border transition-colors cursor-pointer ${
              filter === f ? 'border-gold text-gold' : 'border-border text-muted hover:text-parchment'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Panel className="text-center py-14">
          <QuillIcon size={28} className="text-muted mx-auto mb-3" />
          <p className="text-muted">
            {filter === 'completed' ? 'No completed tasks yet.' : 'No tasks yet — add one above to chart your first star.'}
          </p>
        </Panel>
      ) : (
        <div className="space-y-2">
          {visible.map((t) => (
            <Panel key={t.id} className="flex items-center gap-4 py-3.5">
              <button
                onClick={() => toggleTaskComplete(t.id)}
                aria-label={t.status === 'completed' ? 'Mark pending' : 'Mark complete'}
                className={`w-6 h-6 shrink-0 border flex items-center justify-center transition-colors cursor-pointer ${
                  t.status === 'completed' ? 'bg-gold border-gold text-ink' : 'border-border text-transparent hover:border-gold'
                }`}
              >
                <CheckIcon size={14} />
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-body ${t.status === 'completed' ? 'line-through text-muted' : 'text-parchment'}`}>{t.title}</p>
                <p className="text-xs text-muted mt-0.5 flex gap-3">
                  <span className="capitalize">{t.priority} priority</span>
                  {t.estimatedDuration && <span>{formatMinutes(t.estimatedDuration * 60)} est.</span>}
                </p>
              </div>
              <button
                onClick={() => deleteTask(t.id)}
                className="text-xs text-muted hover:text-danger transition-colors cursor-pointer shrink-0"
              >
                Remove
              </button>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
