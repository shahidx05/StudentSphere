const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className={`${sizes[size]} border-primary/20 border-t-primary rounded-full animate-spin ${className}`} />
  );
};

export const PageSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-3">
      <Spinner size="lg" />
      <p className="text-text-muted text-sm">Loading...</p>
    </div>
  </div>
);

export default Spinner;
