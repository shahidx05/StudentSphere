export default function DashboardCard({ title, value, icon: Icon, color = 'indigo', subtitle, trend }) {
  const colors = {
    indigo:  { box: 'bg-indigo-500/10 border border-indigo-500/20', icon: 'text-indigo-400' },
    primary: { box: 'bg-indigo-500/10 border border-indigo-500/20', icon: 'text-indigo-400' },
    accent:  { box: 'bg-emerald-500/10 border border-emerald-500/20', icon: 'text-emerald-400' },
    danger:  { box: 'bg-red-500/10 border border-red-500/20', icon: 'text-red-400' },
    warning: { box: 'bg-amber-500/10 border border-amber-500/20', icon: 'text-amber-400' },
    purple:  { box: 'bg-purple-500/10 border border-purple-500/20', icon: 'text-purple-400' },
  };
  const c = colors[color] || colors.indigo;
  return (
    <div className="stat-card flex items-start gap-4 group cursor-default">
      {Icon && (
        <div className={`icon-box-lg ${c.box} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} className={c.icon} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-white font-display">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        {trend !== undefined && (
          <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
          </p>
        )}
      </div>
    </div>
  );
}
