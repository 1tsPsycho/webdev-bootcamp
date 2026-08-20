import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Assumption: a hand-rolled canvas nebula stands in for ShaderGradient's
// three.js-based renderer. It reproduces the slow, low-contrast
// purple-maroon nebula the spec calls for without pulling in the
// three/@react-three/fiber/@shadergradient stack, which is a heavy,
// version-fragile dependency chain for a one-shot generated build.
// Swap this component for @shadergradient/react if that stack is set up
// later — the visual contract (a drifting purple/maroon field behind the
// dial) is what matters, not the renderer.
const BLOBS = [
  { color: '#6B21A8', x: 0.32, y: 0.4, r: 0.42, speed: 0.00012, phase: 0 },
  { color: '#6B0F1A', x: 0.68, y: 0.58, r: 0.38, speed: 0.00009, phase: 2 },
  { color: '#8A1826', x: 0.5, y: 0.25, r: 0.3, speed: 0.00015, phase: 4 },
];

export function Nebula({ className = '' }) {
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let raf;
    let running = true;

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw(t) {
      if (!running) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.fillStyle = '#120B1E';
      ctx.fillRect(0, 0, w, h);

      for (const blob of BLOBS) {
        const angle = t * blob.speed + blob.phase;
        const cx = (blob.x + Math.cos(angle) * 0.06) * w;
        const cy = (blob.y + Math.sin(angle) * 0.05) * h;
        const r = blob.r * Math.max(w, h);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, blob.color + 'aa');
        grad.addColorStop(1, blob.color + '00');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      if (!reducedMotion) raf = requestAnimationFrame(draw);
    }

    draw(0);
    return () => {
      running = false;
      window.removeEventListener('resize', resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${className}`} aria-hidden="true" />;
}
