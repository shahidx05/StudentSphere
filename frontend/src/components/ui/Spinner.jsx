export default function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-7 h-7 border-2', lg: 'w-11 h-11 border-2' }[size] || 'w-7 h-7 border-2';
  return (
    <div className={`${s} border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin`} />
  );
}

export function PageSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-sm text-slate-500">Loading...</p>
    </div>
  );
}
