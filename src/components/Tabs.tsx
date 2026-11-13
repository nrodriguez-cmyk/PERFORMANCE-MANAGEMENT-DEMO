import React from 'react';
import { cn } from '../lib/utils';

interface TabsProps {
  tabs: string[];
  activeTab: number;
  onChange: (index: number) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6 border-b border-zinc-800">
      {tabs.map((tab, index) => {
        const isActive = activeTab === index;
        return (
          <button
            key={tab}
            onClick={() => onChange(index)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2",
              isActive 
                ? "border-kangaroo text-kangaroo" 
                : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
            )}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
