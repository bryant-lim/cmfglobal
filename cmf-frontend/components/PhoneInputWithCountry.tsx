'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, Phone } from 'lucide-react';
import { COUNTRIES, Country } from '@/lib/country-data';
import { clsx } from 'clsx';

interface PhoneInputWithCountryProps {
  label: string;
  value: string; // The full concatenated phone number
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function PhoneInputWithCountry({ 
  label, 
  value, 
  onChange, 
  placeholder,
  required 
}: PhoneInputWithCountryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Parse existing value to split dial code and number
  // This is a bit tricky since dial codes vary in length.
  // We'll try to find the longest matching dial code from the start of the string.
  const { currentCountry, phoneNumber } = useMemo(() => {
    if (!value) return { currentCountry: COUNTRIES.find(c => c.name === "China") || COUNTRIES[0], phoneNumber: '' };
    
    // Sort by dialCode length descending to match longest first (e.g. +1-268 before +1)
    const sortedCountries = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
    const country = sortedCountries.find(c => value.startsWith(c.dialCode));
    
    if (country) {
      return { 
        currentCountry: country, 
        phoneNumber: value.slice(country.dialCode.length) 
      };
    }
    
    return { currentCountry: COUNTRIES.find(c => c.name === "China") || COUNTRIES[0], phoneNumber: value };
  }, [value]);

  const filteredCountries = useMemo(() => 
    COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.dialCode.includes(search)
    ),
    [search]
  );

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleCountrySelect = (country: Country) => {
    onChange(country.dialCode + phoneNumber);
    setIsOpen(false);
    setSearch('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^\d]/g, ''); // Only allow digits
    onChange(currentCountry.dialCode + newNumber);
  };

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black uppercase text-gray-600 ml-1">
        {label} {required && '*'}
      </label>
      
      <div className="flex gap-2">
        {/* Country Code Selector */}
        <div className="relative shrink-0" ref={wrapperRef}>
          <div 
            onClick={() => setIsOpen(!isOpen)}
            className={clsx(
              "flex items-center justify-between space-x-2 px-4 py-4 bg-white border border-gray-300 rounded-2xl cursor-pointer hover:border-red-200 transition-all shadow-sm min-w-[100px]",
              isOpen && "ring-2 ring-red-100 border-red-200"
            )}
          >
            <span className="text-sm font-bold text-gray-900">{currentCountry.dialCode}</span>
            <ChevronDown size={14} className={clsx("text-gray-400 transition-transform", isOpen && "rotate-180")} />
          </div>

          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[150] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 border-b border-gray-100 flex items-center space-x-2">
                <Search size={14} className="text-gray-400" />
                <input 
                  autoFocus 
                  className="w-full outline-none text-sm font-medium" 
                  placeholder="Search country..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="max-h-[250px] overflow-y-auto">
                {filteredCountries.map(c => (
                  <div 
                    key={`${c.code}-${c.dialCode}`} 
                    onClick={() => handleCountrySelect(c)}
                    className="px-4 py-3 hover:bg-red-50 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900 group-hover:text-[var(--color-cmf-red)]">{c.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{c.dialCode}</span>
                    </div>
                    {currentCountry.code === c.code && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-cmf-red)]" />
                    )}
                  </div>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="p-5 text-xs text-gray-400 font-bold text-center">No results found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="relative flex-1">
          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder={placeholder || "Phone Number"}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold shadow-sm placeholder:text-gray-300"
          />
        </div>
      </div>
    </div>
  );
}
