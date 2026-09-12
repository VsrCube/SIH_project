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
  AlertCircle,
  User,
  CheckCircle2,
  ShieldCheck,
  UserPlus,
  LogIn
} from 'lucide-react';
import { useAuthRole } from '../context/RoleThemeContext';
import { RoleSlider } from '../components/common/RoleSlider';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';
import TextType from '../components/common/TextType';
import DecryptedText from '../components/common/DecryptedText';
import TargetCursor from '../components/common/TargetCursor';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { 
    selectedRole, 
    slideDirection, 
    isAdminSelected, 
    isOfficerSelected, 
    switchSelectedRole, 
    login,
    register,
    loginWithGoogle,
    authLoading 
  } = useAuthRole();

  // Auth Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState('signin');
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(isAdminSelected ? 'admin@geomine.gov.in' : 'officer.geologist@cil.gov.in');
  const [password, setPassword] = useState('geomine2026');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Sync default demo credentials when switching role
  const handleRoleSelect = (role) => {
    switchSelectedRole(role);
    setErrorMessage('');
    setSuccessMessage('');
    if (authMode === 'signin') {
      if (role === 'admin') {
        setEmail('admin@geomine.gov.in');
        setPassword('admin@secure2026');
      } else {
        setEmail('officer.geologist@cil.gov.in');
        setPassword('strata@safe2026');
      }
    }
  };

  const handleModeSwitch = (mode) => {
    setAuthMode(mode);
    setErrorMessage('');
    setSuccessMessage('');
    if (mode === 'signup') {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
    } else {
      if (isAdminSelected) {
        setEmail('admin@geomine.gov.in');
        setPassword('admin@secure2026');
      } else {
        setEmail('officer.geologist@cil.gov.in');
        setPassword('strata@safe2026');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (authMode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full official name.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify and try again.');
        return;
      }
      if (!agreeTerms) {
        setErrorMessage('You must acknowledge DGMS & Geo-Mine operational clearance guidelines.');
        return;
      }

      setIsSubmitting(true);
      try {
        await register(email, password, fullName.trim(), selectedRole);
        setSuccessMessage('Account registered successfully! Redirecting to dashboard...');
        setTimeout(() => {
          navigate(selectedRole === 'admin' ? '/admin' : '/officer');
        }, 500);
      } catch (err) {
        setErrorMessage(err.message || 'Registration failed. Please check your credentials.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Sign In Mode
      setIsSubmitting(true);
      try {
        await login(email, password, selectedRole);
        navigate(selectedRole === 'admin' ? '/admin' : '/officer');
      } catch (err) {
        setErrorMessage(err.message || 'Authentication error. Please check your credentials.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage('');
    setSuccessMessage('');
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
    setSuccessMessage('');
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
      
      {/* TargetCursor interactive crosshair animation */}
      <TargetCursor 
        spinDuration={2}
        hideDefaultCursor={false}
        parallaxOn={true}
        hoverDuration={0.2}
        cursorColor={isAdminSelected ? '#3b82f6' : '#10b981'}
        cursorColorOnTarget={isAdminSelected ? '#1d4ed8' : '#047857'}
      />

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
          key={`info-${selectedRole}-${authMode}`}
          className={`lg:col-span-6 space-y-6 ${animationClass}`}
        >
          <div className="cursor-target inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md shadow-sm transition-colors duration-500 bg-white/90 border-stone-200">
            <Sparkles className={`w-3.5 h-3.5 ${isAdminSelected ? 'text-blue-600' : 'text-emerald-600'}`} />
            <span className={isAdminSelected ? 'text-blue-900' : 'text-emerald-900'}>
              SIH26023 • Geo-Mine AI
            </span>
          </div>

          <div>
            <h1 className="cursor-target text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-stone-900 cursor-default">
              {authMode === 'signup' ? (
                <>
                  <DecryptedText
                    key={`reg-label-${selectedRole}`}
                    text="Register New"
                    speed={95}
                    maxIterations={16}
                    animateOn="view"
                    sequential={true}
                    revealDirection="start"
                    className="text-stone-900"
                    encryptedClassName="text-stone-400 opacity-70"
                  />
                  <br />
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
                    isAdminSelected 
                      ? 'from-blue-600 via-blue-500 to-cyan-600' 
                      : 'from-emerald-600 via-emerald-500 to-teal-600'
                  }`}>
                    <DecryptedText
                      key={`reg-role-${selectedRole}`}
                      text={isAdminSelected ? 'Admin' : 'Officer'}
                      speed={110}
                      maxIterations={18}
                      animateOn="view"
                      sequential={true}
                      revealDirection="start"
                      className={isAdminSelected ? 'text-blue-600' : 'text-emerald-600'}
                      encryptedClassName={isAdminSelected ? 'text-blue-300' : 'text-emerald-300'}
                    />
                  </span>
                </>
              ) : (
                <>
                  <DecryptedText
                    key={`welcome-label-${selectedRole}`}
                    text="Welcome"
                    speed={95}
                    maxIterations={16}
                    animateOn="view"
                    sequential={true}
                    revealDirection="start"
                    className="text-stone-900"
                    encryptedClassName="text-stone-400 opacity-70"
                  />
                  <br />
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
                    isAdminSelected 
                      ? 'from-blue-600 via-blue-500 to-cyan-600' 
                      : 'from-emerald-600 via-emerald-500 to-teal-600'
                  }`}>
                    <DecryptedText
                      key={`welcome-role-${selectedRole}`}
                      text={isAdminSelected ? 'Admin' : 'Officer'}
                      speed={110}
                      maxIterations={18}
                      animateOn="view"
                      sequential={true}
                      revealDirection="start"
                      className={isAdminSelected ? 'text-blue-600' : 'text-emerald-600'}
                      encryptedClassName={isAdminSelected ? 'text-blue-300' : 'text-emerald-300'}
                    />
                  </span>
                </>
              )}
            </h1>

            {/* Dynamic TextType Typing Animation Effect */}
            <div className="mt-4 min-h-[32px] flex items-center">
              <div className="cursor-target inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 backdrop-blur-md border border-stone-200/80 shadow-sm max-w-full">
                <span className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${
                  isAdminSelected ? 'bg-blue-500' : 'bg-emerald-500'
                }`} />
                <TextType 
                  key={`texttype-${selectedRole}-${authMode}`}
                  text={
                    isAdminSelected 
                      ? [
                          "Vector Ingestion & HNSW Embedding Workbench",
                          "PostgreSQL Anti-Hallucination Gatekeeper",
                          "High-Dimensional Geological Cluster Indexing",
                          "DGMS Safety & Master Record Telemetry"
                        ]
                      : [
                          "Strata Intelligence & DGMS Safety Assessment",
                          "Grounded Gemini 2.5 Flash Strata Insights",
                          "Token-Verified Geological Citation Auditing",
                          "Coal Seam Hazard Early Warning System"
                        ]
                  }
                  typingSpeed={50}
                  pauseDuration={2000}
                  deletingSpeed={28}
                  showCursor={true}
                  cursorCharacter="|"
                  cursorClassName={`font-bold ${isAdminSelected ? 'text-blue-600' : 'text-emerald-600'}`}
                  className={`text-xs sm:text-sm font-semibold tracking-normal ${
                    isAdminSelected ? 'text-slate-800' : 'text-emerald-950'
                  }`}
                />
              </div>
            </div>

            <p className="mt-4 text-sm sm:text-base text-stone-600 max-w-md leading-relaxed">
              {authMode === 'signup'
                ? `Create your official verified credentials to access real-time geological strata monitoring and compliance tools.`
                : `Sign in to access AI-powered strata intelligence, DGMS compliance logs, and vector telemetry.`}
            </p>
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
            <div className="cursor-target flex flex-col items-center mb-5">
              <span className={`text-[11px] font-bold tracking-wider uppercase mb-2 ${
                isAdminSelected ? 'text-blue-700' : 'text-emerald-700'
              }`}>
                Select Terminal Role
              </span>
              <RoleSlider size="lg" />
            </div>

            {/* Auth Mode Tabs (Sign In vs Sign Up) */}
            <div className="flex p-1 bg-stone-100/90 rounded-2xl mb-5 border border-stone-200/80 shadow-inner">
              <button
                type="button"
                onClick={() => handleModeSwitch('signin')}
                className={`cursor-target flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  authMode === 'signin'
                    ? isAdminSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('signup')}
                className={`cursor-target flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  authMode === 'signup'
                    ? isAdminSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Sign Up
              </button>
            </div>

            {/* Form Header Title */}
            <div className="text-center mb-5">
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center justify-center gap-2">
                {isAdminSelected ? (
                  <>
                    <Cpu className="w-5 h-5 text-blue-600" />
                    {authMode === 'signup' ? 'Register Admin Access' : 'Admin Control Panel'}
                  </>
                ) : (
                  <>
                    <HardHat className="w-5 h-5 text-emerald-600" />
                    {authMode === 'signup' ? 'Register Officer Account' : 'Field Officer Portal'}
                  </>
                )}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {authMode === 'signup'
                  ? (isAdminSelected ? 'Create administrative credentials for vector ingestion' : 'Create field officer account for DGMS strata analysis')
                  : (isAdminSelected ? 'Sign in to access vector ingestion & administrative controls' : 'Sign in to access strata RAG & DGMS compliance reports')
                }
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

            {/* Success Message Alert */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                <div className="flex-1">
                  <span className="font-semibold">{successMessage}</span>
                </div>
              </div>
            )}

            {/* Google Auth Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isSubmitting || isGoogleLoading || authLoading}
                className={`cursor-target w-full py-2.5 sm:py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-3 border bg-white hover:bg-stone-50 text-stone-800 shadow-sm transition-all duration-300 transform active:scale-98 ${
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
                    <span>
                      {authMode === 'signup' ? 'Sign up' : 'Sign in'} with Google ({isAdminSelected ? 'Admin' : 'Officer'})
                    </span>
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
                  {authMode === 'signup' ? 'Or register with official email' : 'Or sign in with email'}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {/* Full Name field only in Sign Up Mode */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name & Designation
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder={isAdminSelected ? 'e.g. Eng. Vikram Sharma' : 'e.g. Geol. Priya Mukherjee'}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 shadow-sm transition-all ${
                        isAdminSelected
                          ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-400/20'
                          : 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-400/20'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    {authMode === 'signup' ? 'Create Password' : 'Password'}
                  </label>
                  {authMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className={`cursor-target text-xs hover:underline transition-colors font-semibold ${
                        isAdminSelected ? 'text-blue-700 hover:text-blue-900' : 'text-emerald-700 hover:text-emerald-900'
                      }`}
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={authMode === 'signup' ? 'Min 6 characters' : '••••••••••••'}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-2xl border bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 shadow-sm transition-all ${
                      isAdminSelected
                        ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-400/20'
                        : 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-400/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-target absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password in Sign Up Mode */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Repeat password"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-2xl border bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 shadow-sm transition-all ${
                        isAdminSelected
                          ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-400/20'
                          : 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-400/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="cursor-target absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Options / Checkboxes */}
              {authMode === 'signin' ? (
                <div className="flex items-center justify-between pt-1">
                  <label className="cursor-target flex items-center gap-2 cursor-pointer select-none">
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
                    className={`cursor-target text-xs hover:underline transition-colors font-semibold ${
                      isAdminSelected ? 'text-blue-600 hover:text-blue-800' : 'text-emerald-600 hover:text-emerald-800'
                    }`}
                  >
                    Fill Demo Creds
                  </button>
                </div>
              ) : (
                <div className="pt-1">
                  <label className="cursor-target flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className={`mt-0.5 rounded focus:ring-0 ${
                        isAdminSelected ? 'border-blue-300 text-blue-600 accent-blue-600' : 'border-emerald-300 text-emerald-600 accent-emerald-600'
                      }`}
                    />
                    <span className="text-xs text-stone-600 leading-tight">
                      I agree to DGMS compliance & geological data handling security protocol.
                    </span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isGoogleLoading || authLoading}
                className={`cursor-target w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-300 transform active:scale-95 text-white ${
                  isAdminSelected
                    ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-blue-500/25'
                    : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/25'
                }`}
              >
                {isSubmitting || authLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {authMode === 'signup' ? 'Creating Official Account...' : 'Authenticating Terminal...'}
                  </div>
                ) : (
                  <>
                    {authMode === 'signup'
                      ? (isAdminSelected ? 'Create Admin Account' : 'Create Officer Account')
                      : (isAdminSelected ? 'Authenticate Admin Terminal' : 'Access Officer Portal')
                    }
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch Mode Footer Prompt */}
            <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
              <span>{authMode === 'signup' ? 'Already registered?' : 'Need an account?'}</span>
              <button
                type="button"
                onClick={() => handleModeSwitch(authMode === 'signup' ? 'signin' : 'signup')}
                className={`cursor-target font-bold hover:underline transition-colors ${
                  isAdminSelected ? 'text-blue-700' : 'text-emerald-700'
                }`}
              >
                {authMode === 'signup' ? 'Sign In Instead →' : 'Register / Sign Up →'}
              </button>
            </div>

            {/* Quick role swap footer */}
            <div className="mt-2 pt-2 flex items-center justify-between text-xs text-stone-400">
              <span>Switching portal?</span>
              <button
                type="button"
                onClick={() => handleRoleSelect(isAdminSelected ? 'officer' : 'admin')}
                className={`cursor-target font-semibold hover:underline transition-colors ${
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

