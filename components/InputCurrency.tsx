import React from 'react';

interface InputCurrencyProps {
  label: string;
  value: number | '';
  onChange: (val: number | '') => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  highlight?: boolean;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean; // New prop for dense layout
}

const InputCurrency: React.FC<InputCurrencyProps> = ({ 
  label, 
  value, 
  onChange, 
  prefix = "R$", 
  suffix,
  step = 0.01,
  highlight = false,
  placeholder = "0.00",
  disabled = false,
  compact = false
}) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // If empty, pass empty string
    if (inputValue === '') {
      onChange('');
      return;
    }

    // Otherwise parse
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className={`font-bold text-gray-500 uppercase tracking-widest ${compact ? 'text-[10px]' : 'text-xs'}`}>{label}</label>
      <div className="relative rounded-lg shadow-sm transition-all duration-200">
        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className={`${disabled ? 'text-gray-300' : 'text-gray-400'} font-medium ${compact ? 'text-xs' : 'sm:text-sm'}`}>{prefix}</span>
          </div>
        )}
        <input
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`block w-full rounded-lg border-0 ${compact ? 'py-2' : 'py-3.5'} ${prefix ? 'pl-8' : 'pl-4'} ${suffix ? 'pr-10' : 'pr-4'} ring-1 ring-inset placeholder:text-gray-300 focus:ring-2 focus:ring-inset sm:text-base transition-colors duration-200 font-medium text-right
            ${disabled 
              ? 'bg-gray-50 text-gray-400 ring-gray-200 cursor-not-allowed' 
              : highlight 
                ? 'bg-[#7CFC00]/10 ring-[#7CFC00] focus:ring-[#7CFC00] text-gray-900 font-bold text-lg' 
                : 'bg-white text-gray-900 ring-gray-200 focus:ring-black'
            }
            ${compact ? 'text-sm' : ''}
          `}
        />
        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className={`${disabled ? 'text-gray-300' : 'text-gray-400'} font-medium ${compact ? 'text-xs' : 'sm:text-sm'}`}>{suffix}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputCurrency;