'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { ReactNode, useEffect, useRef, useState } from 'react';

export interface CheckboxDropdownProps {
  label: string;
  children: ReactNode;
  'data-cy'?: string;
}

export const CheckboxDropdown = ({ label, children, 'data-cy': dataCy }: CheckboxDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-full" data-cy={dataCy}>
      <button
        type="button"
        className="flex items-center justify-between w-full rounded-button border-1 border-input-field-outline bg-input-field-surface px-12 py-8 text-dark-primary text-base cursor-pointer h-40"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="truncate text-left">{label}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <div className="absolute z-50 mt-4 min-w-full w-max rounded-8 border border-divider bg-background-100 shadow-100 py-16 px-8 flex flex-col gap-4">
          {children}
        </div>
      )}
    </div>
  );
};
