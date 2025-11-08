'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import * as Popover from '@radix-ui/react-popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DateRange } from '@/types';

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const presets: { value: DateRange; label: string }[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
];

export function DateRangeSelector({ value, onChange, className }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [customStart, setCustomStart] = React.useState<Date>();
  const [customEnd, setCustomEnd] = React.useState<Date>();

  const selectedPreset = presets.find((p) => p.value === value);
  const displayLabel = selectedPreset?.label || 'Custom Range';

  const handlePresetSelect = (preset: DateRange) => {
    onChange(preset);
    setIsOpen(false);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-between min-w-[200px] font-medium',
              'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm',
              'border-slate-300 dark:border-slate-700',
              'hover:bg-slate-50 dark:hover:bg-slate-800',
              'transition-all duration-200'
            )}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-slate-500" />
              <span className="text-sm">{displayLabel}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500 ml-2" />
          </Button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={5}
            className={cn(
              'z-50 min-w-[200px] rounded-lg border border-slate-200 dark:border-slate-800',
              'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl',
              'animate-in fade-in-0 zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
            )}
          >
            <div className="p-2 space-y-1">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetSelect(preset.value)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm font-medium',
                    'transition-all duration-200',
                    'hover:bg-slate-100 dark:hover:bg-slate-800',
                    value === preset.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-slate-700 dark:text-slate-300'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Display selected date range */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>
          {value === '7d' && 'Past 7 days'}
          {value === '30d' && 'Past 30 days'}
          {value === '90d' && 'Past 90 days'}
          {value === '1y' && 'Past 12 months'}
          {value === 'all' && 'All historical data'}
        </span>
      </div>
    </div>
  );
}
