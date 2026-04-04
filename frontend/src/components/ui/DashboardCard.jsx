import { TrendingUp, TrendingDown } from 'lucide-react';

const DashboardCard = ({ title, value, icon: Icon, color = 'primary', trend, subtitle }) => {
  const colorMap = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    accent: 'text-accent bg-accent/10 border-accent/20',
    danger: 'text-danger bg-danger/10 border-danger/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
    muted: 'text-muted bg-muted/10 border-muted/20',
  };

  const iconColor = {
    primary: 'text-primary',
    accent: 'text-accent',
    danger: 'text-danger',
    warning: 'text-warning',
    muted: 'text-muted',
  };

  return (
    <div className="card-base card-glow animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-display font-bold text-text-primary mt-1">{value}</p>
          {subtitle && <p className="text-text-muted text-xs mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-accent' : 'text-danger'}`}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(trend)}% vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg border ${colorMap[color]}`}>
            <Icon size={20} className={iconColor[color]} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
