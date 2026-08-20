import { DISTRACTION_TYPES } from '../../lib/model';
import { Modal } from '../ui/Modal';

export function DistractionModal({ open, onClose, onSelect }) {
  return (
    <Modal open={open} onClose={onClose} title="What pulled your focus?">
      <div className="grid grid-cols-2 gap-3">
        {DISTRACTION_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => {
              onSelect(type);
              onClose();
            }}
            className="capitalize px-4 py-3 ff-surface-maroon border hover:border-gold text-parchment transition-colors cursor-pointer"
          >
            {type}
          </button>
        ))}
      </div>
    </Modal>
  );
}
