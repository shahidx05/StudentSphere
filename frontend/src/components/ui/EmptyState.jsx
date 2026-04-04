import { PackageOpen, Search, FileText, Users, AlertCircle } from 'lucide-react';

const ICONS = {
  default: PackageOpen,
  search: Search,
  resources: FileText,
  users: Users,
  error: AlertCircle,
};

const EmptyState = ({
  icon = 'default',
  title = 'Nothing here yet',
  description = 'When items are added, they will appear here.',
  action,
}) => {
  const Icon = ICONS[icon] || ICONS.default;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-4">
        <Icon size={28} className="text-muted" />
      </div>
      <h3 className="font-display text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-muted text-sm max-w-sm mb-6">{description}</p>
      {action && action}
    </div>
  );
};

export default EmptyState;
