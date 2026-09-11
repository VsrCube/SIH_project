import React from 'react';
import { Header } from './Header';
import { useRoleTheme } from '../../context/RoleThemeContext';
import { AdminDashboard } from '../../pages/AdminDashboard';
import { OfficerDashboard } from '../../pages/OfficerDashboard';

export const MainLayout = () => {
  const { activeRole, slideDirection, isAdmin } = useRoleTheme();

  const animationClass = slideDirection === 'to-right' ? 'slide-enter-from-left' : 'slide-enter-from-right';

  return (
    <div className="min-h-screen bg-[#faf7f2] cream-grid-pattern text-stone-900 transition-colors duration-500 flex flex-col">
      {/* Top Header with live animated role slider & gradient picker */}
      <Header />

      {/* Main Content Area with Directional Slide Transitions */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div
          key={`dashboard-view-${activeRole}`}
          className={`w-full transition-all duration-500 ${animationClass}`}
        >
          {isAdmin ? <AdminDashboard /> : <OfficerDashboard />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 py-4 text-center text-xs text-stone-500 bg-[#f7f2e9]/60">
        <p>Smart India Hackathon 2026 (SIH26023) • Ministry of Mines & DGMS AI Geological Architecture</p>
      </footer>
    </div>
  );
};
