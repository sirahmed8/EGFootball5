'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface CustomTimeDropdownProps {
  value: number;
  options: { label: string; value: number }[];
  onChange: (val: number) => void;
  width?: string;
}

export function CustomTimeDropdown({
  value,
  options,
  onChange,
  width = 'w-20',
}: CustomTimeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className={`relative ${width}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black text-emerald-400 font-mono text-xs font-black px-2.5 py-1 rounded-xl border border-emerald-500/40 hover:border-emerald-400 flex items-center justify-between transition-all cursor-pointer shadow-md group"
      >
        <span>{selectedOption.label}</span>
        <ChevronDown
          className={`w-3 h-3 text-emerald-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            className="absolute z-[100] bottom-full mb-1 start-0 w-full bg-popover text-popover-foreground border border-emerald-500/40 rounded-2xl p-1 shadow-2xl max-h-36 overflow-y-auto overflow-x-hidden space-y-0.5 [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-center px-2 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  opt.value === value
                    ? 'bg-emerald-500 text-black font-black shadow-md'
                    : 'text-white hover:bg-emerald-500/20 hover:text-emerald-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
