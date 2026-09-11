import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Lock } from 'lucide-react';
import { useAuthRole } from '../../context/RoleThemeContext';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, logout } = useAuthRole();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Cross-role access restriction check!
  if (user.role !== requiredRole) {
    const isOfficerTryingAdmin = user.role === 'officer' && requiredRole === 'admin';
    
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${
        user.role === 'officer' ? 'bg-[#f0fdf4] text-emerald-950' : 'bg-[#f0f7ff] text-blue-950'
      }`}>
        <div className="max-w-md w-full p-8 rounded-3xl bg-white/95 border border-stone-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 border border-rose-300 text-rose-600 flex items-center justify-center shadow-md">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-100 border border-rose-300 text-rose-700 inline-block mb-2">
              403 • Access Restricted
            </span>
            <h2 className="text-xl font-bold text-stone-900">
              Unauthorized Portal Access
            </h2>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              {isOfficerTryingAdmin ? (
                <>
                  You are currently authenticated as an <strong className="text-emerald-700">Officer ({user.email})</strong>. You do not possess Administrator credentials to access the <strong>Admin Control Panel</strong>.
                </>
              ) : (
                <>
                  You are currently authenticated as an <strong className="text-blue-700">Administrator ({user.email})</strong>. You do not have authorization to access the <strong>Field Officer Portal</strong> directly.
                </>
              )}
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              onClick={() => navigate(user.role === 'admin' ? '/admin' : '/officer')}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                user.role === 'officer'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Your {user.role === 'admin' ? 'Admin' : 'Officer'} Portal
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full py-2 px-4 rounded-xl font-medium text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};
