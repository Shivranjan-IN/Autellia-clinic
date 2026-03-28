import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Key, CheckCircle2, ShieldCheck, Timer, RefreshCw, Lock } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';

export function ForgotPassword() {
  const { navigateTo } = useNavigation();
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setMessage({ type: 'error', text: 'OTP expired. Please request a new one.' });
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('otp');
        setTimeLeft(120);
        setMessage({ type: 'success', text: 'OTP sent successfully to your email.' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to send OTP' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to connect to server' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetToken(data.data.resetToken);
        setStep('reset');
        setMessage({ type: 'success', text: 'OTP verified. Set your new password.' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Invalid OTP' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to connect to server' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetToken, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('email'); // Reset internally but show success
        setMessage({ type: 'success', text: 'Password reset successfully!' });
        setTimeout(() => navigateTo('login'), 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to reset password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to connect to server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 transition-all duration-300 transform">
        {/* Header Decoration */}
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
        
        <div className="p-8">
          <button 
            onClick={() => step === 'email' ? navigateTo('login') : setStep('email')}
            className="flex items-center text-slate-500 hover:text-blue-600 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Login</span>
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 animate-pulse">
              {step === 'email' && <Mail className="w-8 h-8" />}
              {step === 'otp' && <Key className="w-8 h-8" />}
              {step === 'reset' && <Lock className="w-8 h-8" />}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {step === 'email' && 'Forgot Password?'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'reset' && 'Reset Password'}
            </h1>
            <p className="text-slate-500 mt-2">
              {step === 'email' && 'Enter your email to receive a password reset code'}
              {step === 'otp' && `We've sent a 6-digit code to ${email}`}
              {step === 'reset' && 'Create a strong new password for your account'}
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-xl mb-6 flex items-start space-x-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" /> : <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <span>Send OTP Code</span>}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="flex flex-col items-center">
                <label className="block text-sm font-semibold text-slate-700 mb-4 text-center">Enter 6-digit Code</label>
                <div className="grid grid-cols-1 w-full max-w-[240px]">
                  <input 
                    type="text" 
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full text-center text-3xl tracking-[0.5em] font-black py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
                
                <div className="mt-6 flex items-center text-slate-500 text-sm font-medium">
                  <Timer className={`w-4 h-4 mr-2 ${timeLeft < 30 ? 'text-red-500' : 'text-blue-500'}`} />
                  <span className={timeLeft < 30 ? 'text-red-500' : ''}>
                    Expires in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <button 
                  type="button"
                  onClick={() => { setTimeLeft(120); handleSendOTP({ preventDefault: () => {} } as any); }}
                  disabled={loading || timeLeft > 0}
                  className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400"
                >
                  Resend OTP Code
                </button>
              </div>
              
              <button 
                type="submit"
                disabled={loading || timeLeft === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <span>Verify OTP</span>}
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <span>Update Password</span>}
              </button>
            </form>
          )}
        </div>
        
        <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-slate-400 mr-2" />
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Secure Healthcare Platform</p>
        </div>
      </div>
    </div>
  );
}
