const Badge = ({ children, variant = 'default', size = 'sm' }) => {
  const variants = {
    default: 'bg-surface-2 text-text-secondary border-border',
    primary: 'bg-primary/10 text-primary border-primary/20',
    accent: 'bg-accent/10 text-accent border-accent/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    lost: 'bg-danger/10 text-danger border-danger/20',
    found: 'bg-accent/10 text-accent border-accent/20',
    available: 'bg-accent/10 text-accent border-accent/20',
    sold: 'bg-muted/10 text-muted border-muted/20',
    reserved: 'bg-warning/10 text-warning border-warning/20',
    internship: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    scholarship: 'bg-accent/10 text-accent border-accent/20',
    hackathon: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    job: 'bg-warning/10 text-warning border-warning/20',
    competition: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span className={`badge-base border font-medium ${variants[variant] || variants.default} ${sizes[size]}`}>
      {children}
    </span>
  );
};

export default Badge;
