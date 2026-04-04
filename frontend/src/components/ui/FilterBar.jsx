const FilterBar = ({ filters, values, onChange }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map(({ key, label, options, placeholder }) => (
        <div key={key} className="flex flex-col gap-1">
          {label && <span className="text-xs text-text-muted font-medium">{label}</span>}
          <select
            value={values[key] || ''}
            onChange={(e) => onChange(key, e.target.value)}
            className="input-base py-2 pr-8 min-w-[140px] text-sm"
          >
            <option value="">{placeholder || `All ${label}`}</option>
            {options.map(({ value, label: optLabel }) => (
              <option key={value} value={value}>{optLabel}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

export default FilterBar;
