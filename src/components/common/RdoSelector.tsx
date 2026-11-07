import React, { useState, useRef, useEffect } from 'react';
import { 
  PHILIPPINE_RDOS, 
  PHILIPPINE_RDO_GROUPS, 
  PhilippineRDO, 
  searchPhilippineRdos,
  findRdo 
} from '../../data/philippineRdos';
import { Search, ChevronDown, Check, Building2, MapPin } from 'lucide-react';

interface RdoSelectorProps {
  value: string;
  onChange: (value: string, rdo?: PhilippineRDO) => void;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  label?: string;
  helperText?: string;
  className?: string;
}

export const RdoSelector: React.FC<RdoSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  required = false,
  id,
  label,
  helperText,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIsland, setSelectedIsland] = useState<string>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentRdo = findRdo(value);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredRdos = searchPhilippineRdos(searchQuery).filter((r) => {
    if (selectedIsland === 'all') return true;
    return r.islandGroup === selectedIsland;
  });

  const handleSelect = (rdo: PhilippineRDO) => {
    onChange(rdo.name, rdo);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-left rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <div className="truncate">
            {currentRdo ? (
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {currentRdo.name}
              </span>
            ) : (
              <span className="text-neutral-400">
                {value || 'Select Bureau of Internal Revenue RDO...'}
              </span>
            )}
          </div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
      </button>

      {helperText && (
        <p className="mt-1 text-[10px] text-neutral-400 font-mono">
          {helperText}
        </p>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-full min-w-[340px] max-w-md rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
          {/* Search Header */}
          <div className="px-3 pb-2 border-b border-neutral-100 dark:border-neutral-800 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by RDO code, city, or region... (e.g. 044, Taguig, Cebu)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-700"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-medium pb-0.5 scrollbar-none">
              {[
                { id: 'all', label: `All (${PHILIPPINE_RDOS.length})` },
                { id: 'Luzon', label: 'NCR / Luzon' },
                { id: 'Visayas', label: 'Visayas' },
                { id: 'Mindanao', label: 'Mindanao' },
                { id: 'LTS', label: 'Large Taxpayers (LTS)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedIsland(tab.id)}
                  className={`px-2 py-0.5 rounded border transition-colors whitespace-nowrap ${
                    selectedIsland === tab.id
                      ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-transparent hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* RDO Results List */}
          <div className="max-h-64 overflow-y-auto py-1 divide-y divide-neutral-100/50 dark:divide-neutral-800/50">
            {filteredRdos.length === 0 ? (
              <div className="p-4 text-center text-neutral-400 text-xs">
                No Revenue District Office found for "{searchQuery}".
              </div>
            ) : (
              filteredRdos.map((rdo) => {
                const isSelected = value === rdo.name || value.includes(rdo.code);
                return (
                  <button
                    key={rdo.code}
                    type="button"
                    onClick={() => handleSelect(rdo)}
                    className={`w-full flex items-start justify-between gap-2 px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                      isSelected ? 'bg-neutral-50 dark:bg-neutral-800/60 font-semibold' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-neutral-900 dark:text-neutral-100 font-bold text-[11px]">
                          {rdo.code}
                        </span>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium">
                          {rdo.shortName}
                        </span>
                        <span className="text-[9px] text-neutral-400 font-mono">
                          {rdo.islandGroup}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-600 dark:text-neutral-400 block truncate mt-0.5">
                        {rdo.name}
                      </span>
                      <span className="text-[9px] text-neutral-400 font-mono block">
                        {rdo.region} · {rdo.provinceOrCity}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="px-3 pt-1.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
            <span>Official BIR RR 1–18 & LTS</span>
            <span>{filteredRdos.length} of {PHILIPPINE_RDOS.length} RDOs</span>
          </div>
        </div>
      )}
    </div>
  );
};
