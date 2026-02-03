'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      if (result?.ok) {
        // Fetch session to get role and redirect
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();

        if (session?.user?.role) {
          // Role-based redirect
          switch (session.user.role) {
            case 'ADMIN':
              router.push('/admin/dashboard');
              break;
            case 'MANAGER':
              router.push('/management/dashboard');
              break;
            case 'COLLECTOR':
              router.push('/mobile');
              break;
            default:
              router.push('/');
          }
        } else {
          router.push('/');
        }
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden">
      {/* Left Panel: Branding & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] relative flex-col justify-center items-center text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 pattern-grid opacity-30 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-[#0F172A] pointer-events-none"></div>

        {/* Abstract decorative elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center justify-center p-12 max-w-lg text-center">
          {/* Logo Construction */}
          <div className="mb-2">
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight">WATU KOBU</h1>
            <h2 className="text-xl font-medium tracking-[0.3em] text-blue-200 mt-1">MULTINIAGA</h2>
          </div>

          <div className="w-16 h-1 bg-[#2563EB] rounded-full my-8"></div>

          <p className="text-lg text-slate-300 font-light leading-relaxed">
            Sistem Manajemen Aset &amp; Penagihan Terintegrasi
          </p>

          <div className="mt-12 flex gap-4 opacity-70">
            <div className="h-2 w-2 rounded-full bg-white"></div>
            <div className="h-2 w-2 rounded-full bg-white/30"></div>
            <div className="h-2 w-2 rounded-full bg-white/30"></div>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex flex-col h-full bg-white relative overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-24 py-12">

          {/* Mobile Logo (visible only on small screens) */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-2xl font-bold text-[#0F172A]">WATU KOBU</h1>
            <p className="text-xs tracking-widest text-[#2563EB] font-semibold">MULTINIAGA</p>
          </div>

          <div className="w-full max-w-[420px] space-y-8">
            {/* Header */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-[#111318] tracking-tight">Welcome Back</h2>
              <p className="mt-2 text-sm text-[#64748B]">Please enter your details to sign in.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-[#111318] block">
                  Email
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@watukobu.co.id"
                    required
                    disabled={isSubmitting}
                    className="block w-full rounded-lg border border-[#E2E8F0] py-3 pl-11 pr-4 text-[#111318] placeholder-gray-400 focus:border-[#2563EB] focus:ring-[#2563EB] sm:text-sm h-12 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-[#111318] block">
                  Password
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isSubmitting}
                    className="block w-full rounded-lg border border-[#E2E8F0] py-3 pl-11 pr-10 text-[#111318] placeholder-gray-400 focus:border-[#2563EB] focus:ring-[#2563EB] sm:text-sm h-12 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={isSubmitting}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Options Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-me"
                    name="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isSubmitting}
                    className="h-4 w-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer disabled:cursor-not-allowed"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-[#111318] cursor-pointer">
                    Remember for 30 days
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-[#2563EB] hover:text-[#1d4ed8] transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] transition-all duration-200 h-12 cursor-pointer disabled:bg-[#2563EB]/70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-700 mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-slate-600">
                <p><span className="font-medium">Admin:</span> admin@watukobu.co.id / admin123</p>
                <p><span className="font-medium">Manager:</span> manager@watukobu.co.id / manager123</p>
                <p><span className="font-medium">Collector:</span> budi.santoso@watukobu.co.id / collector123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full py-6 px-6 lg:px-12 border-t border-gray-100 bg-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 max-w-[420px] mx-auto lg:max-w-none">
            <p className="text-center md:text-left">© 2026 PT. Watu Kobu Multiniaga. All Rights Reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#2563EB] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#2563EB] transition-colors">Help Center</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
