import React from 'react';
import { Palette, Check } from 'lucide-react';
import { useRoleTheme } from '../../context/RoleThemeContext';

export const ThemeGradientPicker = ({ compact = false }) => {
  const { activeGradientKey, setGradientTheme, availableGradients } = useRoleTheme();

  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/90 border border-stone-200/80 shadow-sm backdrop-blur-md">
      {!compact && (
        <span className="text-[11px] font-semibold text-stone-600 px-2 flex items-center gap-1">
          <Palette className="w-3.5 h-3.5 text-stone-500" />
          <span className="hidden sm:inline">Theme:</span>
        </span>
      )}
      <div className="flex items-center gap-1.5">
        {availableGradients.map((theme) => {
          const isSelected = activeGradientKey === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setGradientTheme(theme.id)}
              title={theme.name}
              className={`relative w-6 h-6 rounded-full transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${
                isSelected
                  ? 'ring-2 ring-stone-800 ring-offset-2 scale-105 shadow-md'
                  : 'hover:opacity-90 opacity-75'
              }`}
              style={{ background: theme.swatch }}
            >
              {isSelected && <Check className="w-3 h-3 text-white drop-shadow" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
