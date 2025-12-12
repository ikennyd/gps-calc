import React from 'react';

interface InfoTooltipProps {
  text: string;
  position?: 'top' | 'bottom';
  className?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, position = 'top', className = '' }) => {
  return (
    <div className={`group relative inline-flex items-center justify-center align-middle cursor-help ${className}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <div className={`pointer-events-none absolute left-1/2 -translate-x-1/2 w-48 rounded-lg bg-gray-800 px-3 py-2 text-[11px] leading-tight text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 z-50 text-center font-medium
        ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
      `}>
        {text}
        <div className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent
          ${position === 'top' ? 'top-full border-t-gray-800' : 'bottom-full border-b-gray-800'}
        `}></div>
      </div>
    </div>
  );
};

export default InfoTooltip;