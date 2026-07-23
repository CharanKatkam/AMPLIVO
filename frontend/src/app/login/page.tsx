'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import * as z from 'zod';
import { Zap, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoginError(null);
    try {
      const response = await authService.login({ identifier: data.email, password: data.password });
      login(response.user, response.access_token, response.refresh_token);
      
      // Redirect based on role
      if (response.user.role === 'admin') {
        router.push('/admin');
      } else if (response.user.role === 'sales') {
        router.push('/sales');
      } else if (response.user.role === 'hr') {
        router.push('/hr');
      } else if (response.user.role === 'employee') {
        router.push('/employee');
      } else if (response.user.role === 'crm') {
        router.push('/crm');
      } else {
        router.push('/portal');
      }
    } catch (error: unknown) {
      if (!isAxiosError<{ detail?: string; message?: string }>(error)) {
        setLoginError('Network error. Please try again.');
        return;
      }
      const apiMessage = error.response?.data?.message || error.response?.data?.detail;
      if (apiMessage) {
        setLoginError(apiMessage);
      } else if (!error.response) {
        setLoginError('Network error. Please try again.');
      } else if (error.response.status === 500) {
        setLoginError('Server error. The backend may have a database connection issue.');
      } else {
        setLoginError('Invalid email or password. Please try again.');
      }
    }
  };

  const setDemoCredentials = (role: 'client' | 'admin' | 'sales' | 'hr' | 'employee' | 'crm') => {
    setValue('email', role === 'crm' ? 'crm@amplivo.in' : `${role}@amplivo.in`);
    const passwords: Record<string, string> = {
      admin: 'Admin@123',
      client: 'Client@123',
      sales: 'Sales@123',
      hr: 'Hr@12345',
      employee: 'Employee@123',
      crm: 'Crm@123',
    };
    setValue('password', passwords[role]);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center px-6 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 bg-[#4C1D95] rounded-xl flex items-center justify-center">
              <Zap size={17} className="text-white" />
            </div>
            <span className="text-slate-900 font-bold text-xl" style={{ fontFamily: "'Sora', sans-serif" }}>Amplivo</span>
          </Link>

          <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
            Welcome back
          </h1>
          <p className="text-slate-500 mb-8">Sign in to your client portal account</p>

          {/* Demo credentials banner */}
          <div className="bg-[#4C1D95]/5 border border-[#4C1D95]/15 rounded-xl p-4 mb-6 space-y-3">
            <p className="text-xs text-[#4C1D95] font-semibold">Demo Credentials (Click to fill)</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button 
                type="button" 
                onClick={() => setDemoCredentials('client')}
                className="py-2 px-3 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                Client Demo
              </button>
              <button 
                type="button" 
                onClick={() => setDemoCredentials('admin')}
                className="py-2 px-3 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                Admin Demo
              </button>
              <button 
                type="button" 
                onClick={() => setDemoCredentials('sales')}
                className="py-2 px-3 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                Sales Demo
              </button>
              <button 
                type="button" 
                onClick={() => setDemoCredentials('hr')}
                className="py-2 px-3 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                HR Demo
              </button>
              <button 
                type="button" 
                onClick={() => setDemoCredentials('crm')}
                className="py-2 px-3 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                CRM Demo
              </button>
            </div>
            <div className="pt-2 border-t border-[#4C1D95]/10">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    setValue('email', `${e.target.value}@amplivo.employee`);
                    setValue('password', 'Employee@123');
                  }
                }}
                className="w-full py-2 px-3 text-xs font-medium border border-slate-200 rounded-lg bg-white hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
              >
                <option value="">Select an Employee Role Demo...</option>
                <option value="digital.marketing.strategist">Digital Marketing Strategist</option>
                <option value="seo.specialist">SEO Specialist</option>
                <option value="performance.marketer">Performance Marketer</option>
                <option value="social.media.manager">Social Media Manager</option>
                <option value="content.writer">Content Writer</option>
                <option value="graphic.designer">Graphic Designer</option>
                <option value="video.editor">Video Editor</option>
                <option value="ui.ux.designer">UI/UX Designer</option>
                <option value="web.developer">Web Developer</option>
                <option value="data.analyst">Data Analyst</option>
                <option value="campaign.manager">Campaign Manager</option>
                <option value="account.manager">Account Manager</option>
                <option value="influencer.manager">Influencer Manager</option>
                <option value="sales.executive">Sales Executive</option>
                <option value="client.success.manager">Client Success Manager</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {loginError && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">
                {loginError}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                {...register('email')}
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95] ${
                  errors.email ? 'border-red-300' : 'border-slate-200'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full border rounded-xl px-4 py-3 text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95] ${
                    errors.password ? 'border-red-300' : 'border-slate-200'
                  }`}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('rememberMe')} className="rounded text-[#4C1D95] focus:ring-[#4C1D95]" />
                <span className="text-slate-600">Remember me</span>
              </label>
              <a href="#" className="text-[#4C1D95] hover:underline">Forgot password?</a>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-[#4C1D95] text-white font-semibold py-3.5 rounded-xl hover:bg-[#3b1574] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Signing In...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Google OAuth */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400">Or continue with</span></div>
          </div>
          <button className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#4C1D95] font-semibold hover:underline">Register here</Link>
          </p>
        </div>
      </div>

      {/* Right — Brand Visual */}
      <div
        className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 60%, #06B6D4 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative">
          <div className="text-white text-xs font-semibold uppercase tracking-widest opacity-70 mb-8">Client Portal</div>
          <h2 className="text-4xl font-bold text-white leading-tight max-w-xs mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
            Your Growth Dashboard Awaits
          </h2>
          <p className="text-white/70 max-w-xs leading-relaxed">
            Real-time campaign data, creative approvals, lead tracking, SEO reports, and direct communication with your account manager — all in one place.
          </p>
        </div>

        <div className="relative space-y-3">
          {[
            { label: 'Active Campaigns', value: '4 running' },
            { label: 'Pending Approvals', value: '2 creatives' },
            { label: 'Leads This Month', value: '47 qualified' },
          ].map((item) => (
            <div key={item.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-white/70 text-sm">{item.label}</span>
              <span className="text-white font-semibold text-sm">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
