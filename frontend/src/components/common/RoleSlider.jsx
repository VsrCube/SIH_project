import React, { useState } from 'react';
import { HardHat, Cpu } from 'lucide-react';
import { useAuthRole } from '../../context/RoleThemeContext';

export const RoleSlider = ({ size = 'md', className = '', showLabels = true }) => {
  const { selectedRole, switchSelectedRole, isAdminSelected, isOfficerSelected } = useAuthRole();
  const [rippleKey, setRippleKey] = useState(0);

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const handleToggle = (role) => {
    if (role !== selectedRole) {
      setRippleKey(prev => prev + 1);
      switchSelectedRole(role);
    }
  };

  return (
    <div
      className={`relative inline-flex items-center p-1 rounded-full water-pill-container border transition-all duration-500 select-none ${
        isAdminSelected
          ? 'border-blue-300 shadow-[0_6px_20px_rgba(37,99,235,0.15)]'
          : 'border-emerald-300 shadow-[0_6px_20px_rgba(16,185,129,0.15)]'
      } ${className}`}
      role="tablist"
      aria-label="Role Switcher"
    >
      {/* Expanding Water Ripple Effect on Role Switch */}
      <span
        key={rippleKey}
        className={`absolute inset-0 rounded-full pointer-events-none water-ripple-effect ${
          isAdminSelected
            ? 'border-2 border-blue-400/60 bg-blue-400/10'
            : 'border-2 border-emerald-400/60 bg-emerald-400/10'
        }`}
      />

      {/* Fluid Water Bubble Slider Indicator */}
      <div
        className={`water-bubble-indicator w-[calc(50%-4px)] ${
          isAdminSelected
            ? 'translate-x-0 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-blue-500/30 border border-blue-300/60'
            : 'translate-x-[calc(100%+0px)] bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-emerald-500/30 border border-emerald-300/60'
        }`}
      >
        {/* Specular Liquid Light Shimmer */}
        <div className="absolute top-1 left-2 right-2 h-2 rounded-full bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
      </div>

      {/* Admin Button */}
      <button
        type="button"
        role="tab"
        aria-selected={isAdminSelected}
        onClick={() => handleToggle('admin')}
        className={`relative z-10 flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-300 ${
          isSmall ? 'px-3.5 py-1 text-xs' : isLarge ? 'px-7 py-2.5 text-sm' : 'px-5 py-2 text-xs sm:text-sm'
        } ${
          isAdminSelected
            ? 'text-white drop-shadow-sm'
            : 'text-stone-600 hover:text-blue-700'
        }`}
      >
        <span className={`p-1 rounded-full transition-all duration-300 ${
          isAdminSelected ? 'bg-black/15 text-white scale-110' : 'bg-stone-100 text-stone-500'
        }`}>
          <Cpu className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        </span>
        {showLabels && (
          <span className="tracking-wide flex items-center gap-1.5">
            Admin
            {isAdminSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-200 animate-ping" />}
          </span>
        )}
      </button>

      {/* Officer Button */}
      <button
        type="button"
        role="tab"
        aria-selected={isOfficerSelected}
        onClick={() => handleToggle('officer')}
        className={`relative z-10 flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-300 ${
          isSmall ? 'px-3.5 py-1 text-xs' : isLarge ? 'px-7 py-2.5 text-sm' : 'px-5 py-2 text-xs sm:text-sm'
        } ${
          isOfficerSelected
            ? 'text-white drop-shadow-sm'
            : 'text-stone-600 hover:text-emerald-700'
        }`}
      >
        <span className={`p-1 rounded-full transition-all duration-300 ${
          isOfficerSelected ? 'bg-black/15 text-white scale-110' : 'bg-stone-100 text-stone-500'
        }`}>
          <HardHat className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        </span>
        {showLabels && (
          <span className="tracking-wide flex items-center gap-1.5">
            Officer
            {isOfficerSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping" />}
          </span>
        )}
      </button>
    </div>
  );
};
