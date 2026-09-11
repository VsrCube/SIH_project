import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Cpu, 
  HardHat, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuthRole } from '../context/RoleThemeContext';
import { RoleSlider } from '../components/common/RoleSlider';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { 
    selectedRole, 
    slideDirection, 
    isAdminSelected, 
    isOfficerSelected, 
    switchSelectedRole, 
    login,
    loginWithGoogle,
    authLoading 
  } = useAuthRole();

  const [email, setEmail] = useState(isAdminSelected ? 'admin@geomine.gov.in' : 'officer.geologist@cil.gov.in');
  const [password, setPassword] = useState('geomine2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Sync default demo credentials when switching role
  const handleRoleSelect = (role) => {
    switchSelectedRole(role);
    setErrorMessage('');
    if (role === 'admin') {
      setEmail('admin@geomine.gov.in');
      setPassword('admin@secure2026');
    } else {
      setEmail('officer.geologist@cil.gov.in');
      setPassword('strata@safe2026');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await login(email, password, selectedRole);
      navigate(selectedRole === 'admin' ? '/admin' : '/officer');
    } catch (err) {
      setErrorMessage(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle(selectedRole);
      navigate(selectedRole === 'admin' ? '/admin' : '/officer');
    } catch (err) {
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFillDemoCreds = () => {
    setErrorMessage('');
    if (isAdminSelected) {
      setEmail('admin@geomine.gov.in');
      setPassword('admin@secure2026');
    } else {
      setEmail('officer.geologist@cil.gov.in');
      setPassword('strata@safe2026');
    }
  };

  const animationClass = slideDirection === 'to-right' ? 'slide-enter-from-left' : 'slide-enter-from-right';

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-6 sm:p-12 transition-colors duration-700 relative overflow-hidden ${
      isAdminSelected ? 'pattern-grid-blue text-slate-900' : 'pattern-grid-green text-emerald-950'
    }`}>
      
      {/* Dynamic Background Water Fluid Blobs */}
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-35 pointer-events-none transition-all duration-700 floating-bubble ${
          isAdminSelected ? 'bg-blue-400' : 'bg-emerald-400'
        }`}
      />
      <div
        className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-35 pointer-events-none transition-all duration-700 floating-bubble ${
          isAdminSelected ? 'bg-cyan-400' : 'bg-teal-400'
        }`}
        style={{ animationDelay: '-3s' }}
      />

      {/* Spacious Full-Width 2-Column Grid */}
      <div className="w-full max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center my-auto">
        
        {/* Left Informational Panel */}
        <div
          key={`info-${selectedRole}`}
          className={`lg:col-span-6 space-y-6 ${animationClass}`}
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md shadow-sm transition-colors duration-500 bg-white/90 border-stone-200">
            <Sparkles className={`w-3.5 h-3.5 ${isAdminSelected ? 'text-blue-600' : 'text-emerald-600'}`} />
            <span className={isAdminSelected ? 'text-blue-900' : 'text-emerald-900'}>
              SIH26023 • Geo-Mine AI
            </span>
          </div>

          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-stone-900">
              {isAdminSelected ? (
                <>
                  Welcome <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600">
                    Admin
                  </span>
                </>
              ) : (
                <>
                  Welcome <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600">
                    Officer
                  </span>
                </>
              )}
            </h1>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-6 w-full">
          <div
            className={`p-6 sm:p-10 rounded-3xl transition-all duration-700 relative shadow-2xl ${
              isAdminSelected ? 'glass-panel-admin-blue' : 'glass-panel-officer-green'
            }`}
          >
            {/* Water Bubble Role Slider Toggle */}
            <div className="flex flex-col items-center mb-6">
              <span className={`text-[11px] font-bold tracking-wider uppercase mb-2 ${
                isAdminSelected ? 'text-blue-700' : 'text-emerald-700'
              }`}>
                Select Terminal Role
              </span>
              <RoleSlider size="lg" />
            </div>

            {/* Form Title */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-stone-900 flex items-center justify-center gap-2">
                {isAdminSelected ? (
                  <>
                    <Cpu className="w-5 h-5 text-blue-600" />
                    Admin Control Panel
                  </>
                ) : (
                  <>
                    <HardHat className="w-5 h-5 text-emerald-600" />
                    Field Officer Portal
                  </>
                )}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {isAdminSelected
                  ? 'Sign in to access vector ingestion & administrative controls'
                  : 'Sign in to access strata RAG & DGMS compliance reports'}
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1">
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Google Sign In Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting || isGoogleLoading || authLoading}
                className={`w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-3 border bg-white hover:bg-stone-50 text-stone-800 shadow-sm transition-all duration-300 transform active:scale-98 ${
                  isAdminSelected
                    ? 'border-blue-200 hover:border-blue-400 hover:shadow-blue-500/10'
                    : 'border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-500/10'
                }`}
              >
                {isGoogleLoading ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-4 h-4 border-2 border-stone-400 border-t-stone-800 rounded-full animate-spin" />
                    Connecting to Google...
                  </div>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign in with Google ({isAdminSelected ? 'Admin' : 'Officer'})</span>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white/90 px-3 py-0.5 text-stone-400 font-bold backdrop-blur-sm rounded-full border border-stone-200/70">
                  Or sign in with email
                </span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@geomine.gov.in"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 shadow-sm transition-all ${
                      isAdminSelected
                        ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-400/20'
                        : 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-400/20'
                    }`}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-stone-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className={`text-xs hover:underline transition-colors font-semibold ${
                      isAdminSelected ? 'text-blue-700 hover:text-blue-900' : 'text-emerald-700 hover:text-emerald-900'
                    }`}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-2xl border bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 shadow-sm transition-all ${
                      isAdminSelected
                        ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-400/20'
                        : 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-400/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember & Quick Fill */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={`rounded focus:ring-0 ${
                      isAdminSelected ? 'border-blue-300 text-blue-600 accent-blue-600' : 'border-emerald-300 text-emerald-600 accent-emerald-600'
                    }`}
                  />
                  <span className="text-xs text-stone-600">Keep session active (8h)</span>
                </label>

                <button
                  type="button"
                  onClick={handleFillDemoCreds}
                  className={`text-xs hover:underline transition-colors font-semibold ${
                    isAdminSelected ? 'text-blue-600 hover:text-blue-800' : 'text-emerald-600 hover:text-emerald-800'
                  }`}
                >
                  Fill Demo Creds
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isGoogleLoading || authLoading}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-300 transform active:scale-95 text-white ${
                  isAdminSelected
                    ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-blue-500/25'
                    : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/25'
                }`}
              >
                {isSubmitting || authLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating Terminal...
                  </div>
                ) : (
                  <>
                    {isAdminSelected ? 'Authenticate Admin Terminal' : 'Access Officer Portal'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick role swap footer */}
            <div className="mt-5 pt-4 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
              <span>Switching portal?</span>
              <button
                type="button"
                onClick={() => handleRoleSelect(isAdminSelected ? 'officer' : 'admin')}
                className={`font-bold hover:underline transition-colors ${
                  isAdminSelected ? 'text-emerald-700' : 'text-blue-700'
                }`}
              >
                Switch to {isAdminSelected ? 'Officer' : 'Admin'} →
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultEmail={email}
      />
    </div>
  );
};
