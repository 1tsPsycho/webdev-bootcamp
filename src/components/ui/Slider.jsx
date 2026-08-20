export function Slider({ label, value, onChange, min = 0, max = 1, step = 0.01, formatValue }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-body text-sm text-parchment">{label}</span>
        <span className="font-data text-sm text-gold">{formatValue ? formatValue(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-gold h-1.5 rounded-none bg-border cursor-pointer"
      />
    </label>
  );
}
