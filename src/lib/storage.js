// Browser-only persistence. Assumption: localStorage covers every data shape
// here, including session history — IndexedDB (per the spec's "if session
// history grows large" clause) is left as a follow-up if a user's history
// ever gets large enough to matter; localStorage keeps the build simpler
// and avoids an async storage layer for what is, in practice, small JSON.

const PREFIX = 'focusflow';

export const keys = {
  profileList: `${PREFIX}:profiles`,
  activeProfile: `${PREFIX}:active-profile`,
  profile: (name) => `${PREFIX}:profile:${name}`,
  tasks: (name) => `${PREFIX}:tasks:${name}`,
  sessions: (name) => `${PREFIX}:sessions:${name}`,
  achievements: (name) => `${PREFIX}:achievements:${name}`,
  settings: (name) => `${PREFIX}:settings:${name}`,
};

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable (private browsing) — fail silently,
    // in-memory state still works for the current session
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

export function listProfileNames() {
  return readJSON(keys.profileList, []);
}

export function saveProfileNames(names) {
  writeJSON(keys.profileList, names);
}
