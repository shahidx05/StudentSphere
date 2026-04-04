import { PackageOpen, Search, FileText, Users, AlertCircle } from 'lucide-react';

const ICONS = {
  default: PackageOpen,
  search: Search,
  resources: FileText,
  users: Users,
  error: AlertCircle,
};

export default function EmptyState({ icon = 'default', title = 'Nothing here yet', description = '', action }) {
  const Icon = ICONS[icon] || PackageOpen;
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center fade-in">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
        <Icon size={28} className="text-indigo-400" />
      </div>
      <h3 className="font-display text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-slate-400 text-sm max-w-sm mb-6">{description}</p>}
      {action && action}
    </div>
  );
}
