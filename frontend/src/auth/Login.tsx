import React, { useState, useEffect } from 'react';
import { User } from '../common/types';
import { Building2, Lock, Mail, Smartphone, KeyRound } from 'lucide-react';
import { Button } from '../common/ui/button';
import { Input } from '../common/ui/input';
import { Label } from '../common/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../common/ui/tabs';
import { authService } from '../services/authService';
import { Toaster, toast } from 'sonner';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onLogin: (user: User, token?: string) => void;
  onBack: () => void;
  onRegister: (role: 'doctor' | 'clinic') => void;
  initialTab?: 'email' | 'mobile';
}

export function LoginPage({ onLogin, onBack, onRegister, initialTab = 'email' }: LoginPageProps) {
  const { navigateTo } = useNavigation();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'mobile'>(initialTab as any);

  // Sync activeTab when initialTab changes (e.g., from AppRouter)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Navigate to dashboard when user is authenticated
  useEffect(() => {
    console.log("Login useEffect triggered:", { shouldNavigate, user, userExists: !!user });
    if (shouldNavigate && user) {
      console.log("✅ Login: Navigating to dashboard with user:", user);
      navigateTo('dashboard');
      setShouldNavigate(false);
    } else if (shouldNavigate && !user) {
      console.log("⚠️ Login: shouldNavigate is true but user is null");
    }
  }, [user, shouldNavigate, navigateTo]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log("🔐 Starting email login...");
      const user = await authService.signInWithEmail(email, password);
      console.log("✅ Login successful, user data:", user);
      
      // Get the token from localStorage (authService stores it there)
      const token = localStorage.getItem('auth_token');
      console.log("🔑 Token retrieved from localStorage:", token ? 'EXISTS' : 'MISSING');
      
      // Pass both user and token to onLogin
      onLogin(user, token || undefined);
      console.log("✅ onLogin called with user and token");
      toast.success('Welcome back!');
      // Set flag to navigate after user state is updated
      setShouldNavigate(true);
      console.log("✅ shouldNavigate set to true");
    } catch (err: any) {
      console.error("❌ Login error:", err);
      setError(err.message || 'Invalid credentials');
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      await authService.signInWithGoogle();
      // Supabase will redirect to the callback URL
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google login failed');
      toast.error('Google login failed');
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Implement OTP sending via backend API
      setOtpSent(true);
      toast.info('OTP sent to your mobile number');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Implement OTP verification via backend API
      // For now, this is a placeholder
      toast.error('OTP login not implemented yet');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <Toaster />
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
              <Building2 className="w-6 h-6 text-pink-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Elinic Healthcare</h1>
              <p className="text-sm text-gray-600 dark:text-slate-400">Clinic Management Platform</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="email" className="text-xs sm:text-sm">
                <Mail className="size-3 sm:size-4 mr-1 sm:mr-2" />
                Login
              </TabsTrigger>
              <TabsTrigger value="mobile" className="text-xs sm:text-sm">
                <Smartphone className="size-3 sm:size-4 mr-1 sm:mr-2" />
                OTP
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      className="pl-10"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200 dark:border-slate-600"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-800 px-2 text-gray-500 dark:text-slate-400">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign In With Google
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="mobile">
              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div>
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <div className="relative mt-2">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <Input
                        id="mobile"
                        type="tel"
                        value={mobile}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMobile(e.target.value)}
                        className="pl-10"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  >
                    Send OTP
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOTPLogin} className="space-y-6">
                  <div>
                    <Label htmlFor="otp">Enter OTP</Label>
                    <div className="relative mt-2">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <Input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
                        className="pl-10 tracking-widest text-center"
                        placeholder="123456"
                        maxLength={6}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      OTP sent to {mobile}
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp('');
                        setError('');
                      }}
                      className="flex-1"
                    >
                      Change
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                    >
                      Verify
                    </Button>
                  </div>
                </form>
              )}

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  💡 Demo OTP: <strong>123456</strong>
                </p>
              </div>
            </TabsContent>


          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">New to E-Clinic?</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onRegister('doctor')}
                className="w-full py-2 px-4 border border-pink-300 text-pink-600 rounded-lg hover:bg-pink-50 transition-colors text-sm font-medium"
              >
                Register as Doctor
              </button>
              <button
                onClick={() => onRegister('clinic')}
                className="w-full py-2 px-4 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
              >
                Register Clinic
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
