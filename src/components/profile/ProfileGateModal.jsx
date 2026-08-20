import { useState } from 'react';
import { useAppData } from '../../state/AppDataContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { RingIcon } from '../ui/Icons';

export function ProfileGateModal() {
  const { profileNames, activeName, createProfile, switchProfile } = useAppData();
  const [name, setName] = useState('');
  const [mode, setMode] = useState(profileNames.length > 0 ? 'pick' : 'new');

  const open = !activeName;
  if (!open) return null;

  return (
    <Modal open={open} onClose={() => {}} dismissible={false} title={undefined}>
      <div className="text-center mb-5">
        <RingIcon size={32} className="text-gold mx-auto mb-3" />
        <h2 className="font-display text-3xl text-parchment">Welcome to FocusFlow</h2>
        <p className="text-muted text-sm mt-2">No password, no account — just a name to chart your sky under.</p>
      </div>

      {mode === 'pick' && profileNames.length > 0 ? (
        <div className="space-y-2">
          {profileNames.map((n) => (
            <button
              key={n}
              onClick={() => switchProfile(n)}
              className="w-full text-left px-4 py-3 ff-surface-maroon hover:border-gold border transition-colors cursor-pointer font-body text-parchment"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setMode('new')}
            className="w-full text-center px-4 py-2.5 text-sm text-muted hover:text-gold transition-colors cursor-pointer"
          >
            + New profile
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) createProfile(name);
          }}
          className="space-y-4"
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your display name"
            maxLength={30}
            className="w-full bg-ink border border-border focus:border-gold px-4 py-2.5 text-parchment font-body outline-none"
          />
          <Button type="submit" className="w-full" disabled={!name.trim()}>
            Begin
          </Button>
          {profileNames.length > 0 && (
            <button
              type="button"
              onClick={() => setMode('pick')}
              className="w-full text-center text-sm text-muted hover:text-gold transition-colors cursor-pointer"
            >
              Back to profile list
            </button>
          )}
        </form>
      )}
    </Modal>
  );
}
