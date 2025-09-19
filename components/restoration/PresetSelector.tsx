'use client';

import React, { useState } from 'react';
import { RESTORATION_PRESETS } from '@/lib/constants';
import { PresetType } from '@/types/database';
import { Check } from 'lucide-react';

interface PresetSelectorProps {
  onSelect: (preset: PresetType) => void;
  selectedPreset?: PresetType;
  disabled?: boolean;
}

export default function PresetSelector({
  onSelect,
  selectedPreset = 'automagic',
  disabled = false
}: PresetSelectorProps) {
  const [hoveredPreset, setHoveredPreset] = useState<PresetType | null>(null);

  return (
    <div>
      <h3 className="font-bold text-lg uppercase tracking-wider mb-6">
        Choose Restoration Preset
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {RESTORATION_PRESETS.map((preset) => {
          const isSelected = selectedPreset === preset.id;
          const isHovered = hoveredPreset === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => onSelect(preset.id)}
              onMouseEnter={() => setHoveredPreset(preset.id)}
              onMouseLeave={() => setHoveredPreset(null)}
              disabled={disabled}
              className={`relative bg-white border rounded-md p-4 text-left transition-all ${
                isSelected
                  ? 'border-black shadow-lg'
                  : 'border-black/30 hover:border-black hover:shadow-md'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              <div className="text-3xl mb-3">{preset.icon}</div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-1">
                {preset.name}
              </h4>
              <p className="text-xs text-black/70 line-clamp-2">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>

      {hoveredPreset && (
        <div className="mt-6 p-4 bg-[#F5F0E8] border border-black/20 rounded-md">
          <p className="text-sm text-black/80">
            <span className="font-bold uppercase tracking-wider">Tip: </span>
            {RESTORATION_PRESETS.find(p => p.id === hoveredPreset)?.prompt}
          </p>
        </div>
      )}
    </div>
  );
}