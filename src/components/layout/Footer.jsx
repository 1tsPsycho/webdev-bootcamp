import { useState } from 'react';
import { Modal } from '../ui/Modal';

export function Footer() {
  const [openDoc, setOpenDoc] = useState(null); // 'privacy' | 'terms' | null

  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
        <p>All your data stays in this browser. Nothing is uploaded, nothing is tracked.</p>
        <div className="flex items-center gap-5">
          <button onClick={() => setOpenDoc('privacy')} className="hover:text-gold transition-colors cursor-pointer">
            Privacy
          </button>
          <button onClick={() => setOpenDoc('terms')} className="hover:text-gold transition-colors cursor-pointer">
            Terms
          </button>
        </div>
      </div>

      <Modal open={openDoc === 'privacy'} onClose={() => setOpenDoc(null)} title="Privacy">
        <div className="text-sm text-muted space-y-3 leading-relaxed">
          <p>FocusFlow has no server and no database. Every task, session, and setting you create is written to your browser's local storage on this device only.</p>
          <p>Nothing is sent over the network, nothing is sold, and there's no analytics pixel watching you use it. Clearing your browser storage or using "Export Profile" in Settings are the only ways data leaves or leaves this page.</p>
        </div>
      </Modal>

      <Modal open={openDoc === 'terms'} onClose={() => setOpenDoc(null)} title="Terms">
        <div className="text-sm text-muted space-y-3 leading-relaxed">
          <p>FocusFlow is a free, local tool provided as-is, with no guarantees about uptime, data durability, or fitness for a particular purpose — it's a browser tab, not a service.</p>
          <p>Back up anything you care about using the JSON export in Settings. There is no account recovery, because there's no account.</p>
        </div>
      </Modal>
    </footer>
  );
}
