import React, { useState, useEffect, useRef } from 'react';
import { ChevronUpIcon, SearchIcon } from '../icons';

interface MultiSelectDropdownProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selected,
  onChange,
  placeholder = 'Selecione',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allSelected = options.length > 0 && selected.length === options.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);
  
  const handleSelectAll = () => {
      if (allSelected) {
          onChange([]);
      } else {
          onChange(options.map(o => o.value));
      }
  };
  
  const handleOptionClick = (value: string) => {
      if (selected.includes(value)) {
          onChange(selected.filter(s => s !== value));
      } else {
          onChange([...selected, value]);
      }
  };

  const getButtonLabel = () => {
    if (selected.length === 0) return placeholder;
    if (allSelected) return 'Todas as lojas';
    if (selected.length === 1) {
        const selectedOption = options.find(o => o.value === selected[0]);
        return selectedOption?.label || placeholder;
    }
    return `${selected.length} lojas selecionadas`;
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
      >
        <span className="truncate">{getButtonLabel()}</span>
        <ChevronUpIcon className={`w-5 h-5 text-gray-400 ml-2 transition-transform duration-200 ${!isOpen && 'rotate-180'}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60">
          <div className="p-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="w-5 h-5 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Buscar loja..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="block w-full py-2 pl-10 pr-3 border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
          </div>
          <ul className="py-1 overflow-auto max-h-48">
            <li className="px-3 py-2 text-sm border-b border-gray-200">
               <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                    checked={allSelected}
                    onChange={handleSelectAll}
                  />
                  <span>Todas as lojas</span>
               </label>
            </li>
            {filteredOptions.map(option => (
              <li key={option.value}>
                 <label className="flex items-center w-full px-3 py-2 space-x-3 text-sm transition-colors duration-150 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                      checked={selected.includes(option.value)}
                      onChange={() => handleOptionClick(option.value)}
                    />
                    <span className="truncate">{option.label}</span>
                 </label>
              </li>
            ))}
            {filteredOptions.length === 0 && (
                <li className="px-3 py-2 text-sm text-center text-gray-500">Nenhuma loja encontrada.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;