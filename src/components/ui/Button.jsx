const variants = {
  primary: 'bg-royal text-parchment border border-royal hover:bg-gold hover:text-ink hover:border-gold',
  gold: 'bg-gold text-ink border border-gold hover:bg-gold-soft',
  ghost: 'bg-transparent text-parchment border border-border hover:border-gold hover:text-gold',
  danger: 'bg-transparent text-danger border border-danger hover:bg-danger hover:text-parchment',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({ variant = 'primary', size = 'md', className = '', as: As = 'button', ...props }) {
  return (
    <As
      className={`font-medium tracking-wide transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
