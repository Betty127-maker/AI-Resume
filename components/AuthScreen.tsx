import React, { useState, useEffect } from 'react';
import { authService, User } from '../services/auth';
import { Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, FileCode } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'signup';

const INPUT_CLASS = "w-full pl-10 pr-4 py-3 border-2 border-slate-200/50 bg-slate-200/50 rounded-xl focus:bg-white focus:border-indigo-500/50 focus:ring-0 outline-none text-slate-800 placeholder:text-slate-500 transition-all font-medium text-sm";

export const AuthScreen: React.FC<Props> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load remembered email
    const savedEmail = localStorage.getItem('last_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    await new Promise(r => setTimeout(r, 800));

    const result = authService.signup(email, password);
    setLoading(false);

    if (result.success && result.user) {
      localStorage.setItem('last_email', email);
      onLogin(result.user);
    } else {
      setError(result.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    await new Promise(r => setTimeout(r, 800));

    const result = authService.login(email, password);
    setLoading(false);

    if (result.success && result.user) {
      localStorage.setItem('last_email', email);
      onLogin(result.user);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-architect flex flex-col justify-center items-center p-6 relative overflow-hidden">
      
      {/* Background Decor Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Brand */}
      <div className="mb-8 flex flex-col items-center relative z-10">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 mb-4 transform rotate-3 hover:rotate-0 transition-transform duration-300 ring-4 ring-white">
          <FileCode size={32} strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resume<span className="text-indigo-600">AI</span></h1>
        <p className="text-slate-500 font-medium">Architect your career.</p>
      </div>

      <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-white relative z-10">
        {/* Error Toast */}
        {error && (
          <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-center gap-3 text-rose-600 text-sm font-bold animate-fadeIn">
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="p-8">
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5 animate-slideIn">
              <div className="text-center mb-2">
                 <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
                 <p className="text-sm text-slate-400">Enter your credentials to access</p>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    required
                    autoComplete="email"
                    className={INPUT_CLASS}
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    autoComplete="current-password"
                    className={`${INPUT_CLASS} pr-10`}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-slate-900/20 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
              </button>
              <div className="text-center mt-6">
                <button type="button" onClick={() => { setMode('signup'); setPassword(''); setShowPassword(false); }} className="text-sm text-slate-500 hover:text-indigo-600 font-bold transition-colors">
                  Create an account
                </button>
              </div>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-5 animate-slideIn">
              <div className="text-center mb-2">
                 <h2 className="text-xl font-bold text-slate-900">Get Started</h2>
                 <p className="text-sm text-slate-400">Create your free account</p>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    required
                    autoComplete="email"
                    className={INPUT_CLASS}
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    autoComplete="new-password"
                    className={`${INPUT_CLASS} pr-10`}
                    placeholder="Create a password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-600/30 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Create Account'} <ArrowRight size={18} />
              </button>
               <div className="text-center mt-6">
                <button type="button" onClick={() => { setMode('login'); setPassword(''); setShowPassword(false); }} className="text-sm text-slate-500 hover:text-indigo-600 font-bold transition-colors">
                  Already have an account?
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <p className="mt-8 text-xs font-bold text-slate-400 text-center max-w-sm uppercase tracking-widest relative z-10">
        Demo Application • Local Storage
      </p>
    </div>
  );
};