import { formatMinutes } from './time';

/** Renders a shareable "Daily Recap" card to an offscreen canvas and triggers a PNG download. */
export function downloadDailyRecap({ displayName, dateLabel, focusScore, studySeconds, tasksCompleted, distractionCount }) {
  const w = 1080;
  const h = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // background
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#120B1E');
  bg.addColorStop(0.55, '#241536');
  bg.addColorStop(1, '#2c1420');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // scattered stars
  let seed = 42;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = rand() > 0.8 ? 'rgba(212,175,55,0.8)' : 'rgba(243,236,224,0.35)';
    const r = rand() * 1.6 + 0.4;
    ctx.beginPath();
    ctx.arc(rand() * w, rand() * h, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // border
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, w - 80, h - 80);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#A99BB5';
  ctx.font = '32px Manrope, sans-serif';
  ctx.fillText('FOCUSFLOW · DAILY RECAP', w / 2, 150);

  ctx.fillStyle = '#F3ECE0';
  ctx.font = '48px Manrope, sans-serif';
  ctx.fillText(dateLabel, w / 2, 210);

  // focus score ring
  const cx = w / 2;
  const cy = 500;
  const radius = 220;
  ctx.strokeStyle = '#6B0F1A';
  ctx.lineWidth = 26;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#D4AF37';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + (focusScore / 100) * Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 140px "Space Mono", monospace';
  ctx.fillText(String(focusScore), cx, cy + 45);
  ctx.fillStyle = '#A99BB5';
  ctx.font = '28px Manrope, sans-serif';
  ctx.fillText('FOCUS SCORE', cx, cy + 100);

  // stats row
  const stats = [
    [formatMinutes(studySeconds), 'STUDIED'],
    [String(tasksCompleted), 'TASKS DONE'],
    [String(distractionCount), 'DISTRACTIONS'],
  ];
  const statY = 900;
  stats.forEach(([value, label], i) => {
    const x = w / 2 + (i - 1) * 300;
    ctx.fillStyle = '#F3ECE0';
    ctx.font = 'bold 56px "Space Mono", monospace';
    ctx.fillText(value, x, statY);
    ctx.fillStyle = '#A99BB5';
    ctx.font = '22px Manrope, sans-serif';
    ctx.fillText(label, x, statY + 40);
  });

  ctx.fillStyle = '#F3ECE0';
  ctx.font = 'italic 40px "Cormorant Garamond", serif';
  ctx.fillText(`— ${displayName}'s sky —`, w / 2, h - 100);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-recap-${dateLabel.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
