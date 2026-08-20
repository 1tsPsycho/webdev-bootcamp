import { forwardRef } from 'react';

export const Panel = forwardRef(function Panel({ tone = 'purple', className = '', children, ...props }, ref) {
  const toneClass = tone === 'maroon' ? 'ff-surface-maroon' : 'ff-surface';
  return (
    <div ref={ref} className={`${toneClass} p-5 ${className}`} {...props}>
      {children}
    </div>
  );
});

export function PanelHeading({ eyebrow, title, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        {eyebrow && <p className="font-body text-xs tracking-[0.18em] uppercase text-muted mb-1">{eyebrow}</p>}
        {title && <h3 className="font-display text-2xl text-parchment">{title}</h3>}
      </div>
      {action}
    </div>
  );
}
