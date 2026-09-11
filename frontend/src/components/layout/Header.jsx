import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cpu, HardHat, LogOut } from 'lucide-react';
import { useRoleTheme } from '../../context/RoleThemeContext';
import { RoleSlider } from '../common/RoleSlider';
import { ThemeGradientPicker } from '../common/ThemeGradientPicker';

export const Header = () => {
  const navigate = useNavigate();
  const { activeRole, isAdmin, currentGradient } = useRoleTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-colors duration-500 bg-[#faf7f2]/95 border-stone-200/80 shadow-[0_2px_10px_rgba(140,110,80,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold transition-all duration-300 shadow-md bg-gradient-to-r ${currentGradient.gradient}`}
            >
              {isAdmin ? <Cpu className="w-5 h-5" /> : <HardHat className="w-5 h-5" />}
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-stone-900">
                Geo-Mine <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentGradient.gradient}`}>AI</span>
              </span>
              <span className={`ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${currentGradient.badgeBg}`}>
                {isAdmin ? 'Admin' : 'Officer'}
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Live Role Slider */}
        <div className="flex items-center justify-center">
          <RoleSlider size="md" />
        </div>

        {/* Right: Theme Gradient Selector & Sign Out */}
        <div className="flex items-center gap-3">
          <ThemeGradientPicker compact={true} />

          <button
            onClick={() => navigate('/login')}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-white/90 text-stone-700 border-stone-300/80 text-xs font-semibold shadow-sm transition-all duration-700 ease-in-out hover:bg-red-600 hover:border-red-500 hover:text-white hover:shadow-lg hover:shadow-red-600/40 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 transition-all duration-700 group-hover:-translate-x-0.5 text-current group-hover:text-white" />
            <span className="hidden sm:inline transition-colors duration-700 text-current group-hover:text-white">Sign Out</span>
          </button>
        </div>

      </div>
    </header>
  );
};
