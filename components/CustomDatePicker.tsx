import React, { useState, useEffect, useRef } from 'react';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
}

const DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, label, placeholder = "Selecione a data" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date()); // For navigation
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize navigation date based on value or today
  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      // Create date using UTC to avoid timezone shifts on simple yyyy-mm-dd strings
      const date = new Date(y, m - 1, d); 
      setCurrentDate(date);
    }
  }, []); // Only run once on mount regarding value init for navigation

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 1-12
    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty slots
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const isSelected = value === dateStr;
        const isToday = new Date().toISOString().split('T')[0] === dateStr;

        days.push(
            <button
                key={day}
                onClick={(e) => { e.stopPropagation(); handleSelectDate(day); }}
                className={`
                    h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                    ${isSelected 
                        ? 'bg-[#7CFC00] text-black font-bold shadow-[0_0_10px_rgba(124,252,0,0.4)]' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                    ${!isSelected && isToday ? 'border border-gray-600' : ''}
                `}
            >
                {day}
            </button>
        );
    }

    return days;
  };

  // Format display value
  const displayValue = value ? new Date(value + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : placeholder;

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
            w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200
            ${value 
                ? 'bg-[#7CFC00] text-black font-bold shadow-md ring-2 ring-[#7CFC00]/20' 
                : 'bg-white border border-gray-200 text-gray-400 hover:border-gray-300'
            }
        `}
      >
        <span className="truncate">{displayValue}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-[#0f1115] border border-gray-800 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <span className="text-white font-bold capitalize">
                    {MONTHS[currentDate.getMonth()]} <span className="text-gray-500 font-medium">{currentDate.getFullYear()}</span>
                </span>
                <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((d, i) => (
                    <div key={i} className="text-center text-xs font-bold text-gray-600 uppercase h-8 flex items-center justify-center">
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 place-items-center">
                {renderCalendar()}
            </div>
            
            {/* Footer Actions */}
            <div className="mt-4 pt-3 border-t border-gray-800 flex justify-end gap-2">
                <button 
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-bold text-gray-500 hover:text-white px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
                >
                    Cancelar
                </button>
                {/* Optional confirmation button logic could go here */}
            </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;