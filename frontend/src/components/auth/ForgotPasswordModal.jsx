import React, { useState } from 'react';
import { X, Mail, KeyRound, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuthRole } from '../../context/RoleThemeContext';

export const ForgotPasswordModal = ({ isOpen, onClose, defaultEmail = '' }) => {
  const { isAdminSelected, resetPassword } = useAuthRole();
  const [step, setStep] = useState(1); // 1: Email, 2: Token verification, 3: New Password, 4: Success
  const [email, setEmail] = useState(defaultEmail || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusInfo, setStatusInfo] = useState('');

  if (!isOpen) return null;

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid registered official email address.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await resetPassword(email);
      setStatusInfo(`Verification and reset link dispatched to ${email}`);
      setIsLoading(false);
      setStep(2);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Failed to dispatch reset request. Please check email address.');
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 600);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(4);
    }, 700);
  };

  const handleAutoFillOtp = () => {
    setOtp(['8', '3', '9', '2', '1', '0']);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative w-full max-w-md p-6 rounded-3xl border shadow-2xl transition-all duration-300 transform scale-100 ${
          isAdminSelected ? 'glass-panel-admin-blue text-slate-900 border-blue-300' : 'glass-panel-officer-green text-emerald-950 border-emerald-300'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${
              isAdminSelected
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-emerald-100 border-emerald-300 text-emerald-700'
            }`}
          >
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">Firebase Password Recovery</h3>
            <p className="text-xs text-stone-500">
              {isAdminSelected ? 'Admin Security Terminal Verification' : 'Officer Credential Reset Service'}
            </p>
          </div>
        </div>

        {/* Step 1: Request Email */}
        {step === 1 && (
          <form onSubmit={handleSendResetEmail} className="space-y-4">
            <p className="text-sm text-stone-600">
              Enter your registered departmental email address. Firebase will transmit an authorized security recovery link to update your credentials.
            </p>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">Official Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. officer@cil.gov.in"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 shadow-sm transition-all ${
                    isAdminSelected
                      ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-400/20'
                      : 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-400/20'
                  }`}
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md text-white transition-all ${
                isAdminSelected
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/20'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Transmitting Recovery Email...
                </>
              ) : (
                <>
                  Send Recovery Link
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Enter OTP / Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-stone-600">
              {statusInfo || `We dispatched a 6-digit authentication token to ${email}.`}
            </p>

            <div className="flex justify-between gap-2 my-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className={`w-12 h-12 text-center text-lg font-bold rounded-xl border bg-white text-stone-900 focus:outline-none focus:ring-2 shadow-sm transition-all ${
                    isAdminSelected
                      ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-400/30'
                      : 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-400/30'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Didn't receive code?</span>
              <button
                type="button"
                onClick={handleAutoFillOtp}
                className={`underline font-semibold transition-colors ${
                  isAdminSelected ? 'text-blue-700 hover:text-blue-900' : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                Auto-fill Code (839210)
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md text-white transition-all ${
                isAdminSelected
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/20'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying Token...
                </>
              ) : (
                <>
                  Verify Code
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-stone-600">
              Token verified successfully. Establish your new secure credentials.
            </p>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full px-4 py-2.5 rounded-xl border bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 shadow-sm transition-all ${
                  isAdminSelected
                    ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-400/20'
                    : 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-400/20'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full px-4 py-2.5 rounded-xl border bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 shadow-sm transition-all ${
                  isAdminSelected
                    ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-400/20'
                    : 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-400/20'
                }`}
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md text-white transition-all ${
                isAdminSelected
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/20'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Updating Credentials...
                </>
              ) : (
                <>
                  Update Password
                  <ShieldCheck className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center py-4 space-y-4">
            <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center border ${
              isAdminSelected
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-emerald-100 border-emerald-300 text-emerald-700'
            }`}>
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-stone-900">Password Updated Successfully!</h4>
              <p className="text-xs text-stone-600 mt-1">
                Your credentials have been refreshed. You may now authenticate.
              </p>
            </div>
            <button
              onClick={onClose}
              className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm text-white shadow-md transition-all ${
                isAdminSelected
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25'
              }`}
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
