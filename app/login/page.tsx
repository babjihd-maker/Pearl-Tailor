'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Scissors, Facebook, Twitter, Linkedin, Loader2, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // 1. Admin Login
      if (username === 'admin' && password === 'admin123') {
        router.push('/dashboard');
        return;
      }

      // 2. Customer Login
      const { data: customer, error: dbError } = await supabase
        .from('customers')
        .select('id, name')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (dbError || !customer) {
        throw new Error('Invalid Username or Password');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 font-sans overflow-hidden">
      
      {/* 1. FULL PAGE BACKGROUND IMAGE */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop")',
            filter: 'blur(8px) brightness(0.7)' // Blurred and Darkened for focus
        }}
      ></div>

      {/* 2. LOGIN CARD */}
      <div className="relative z-10 w-full max-w-5xl bg-white/10 backdrop-blur-sm rounded-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-160 border border-white/20">
        
        {/* --- LEFT SIDE (Transparent / Glass) --- */}
        <div className="w-full md:w-1/2 relative hidden md:flex flex-col justify-between p-12 text-white bg-black/20">
          
          {/* Logo Area */}
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <Scissors className="w-7 h-7 text-[#E91E63]" />
             </div>
             <h1 className="text-3xl font-black tracking-tight">Pearl</h1>
          </div>

          {/* Text Content */}
          <div className="mb-12">
             <h2 className="text-4xl font-black mb-4 leading-tight">Check the Status<br/>of your Order.</h2>
             <p className="text-sm font-medium text-slate-200 leading-relaxed max-w-sm mb-8">
                A long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
             </p>

             {/* Social Icons */}
             <div className="flex gap-4">
                <button className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-[#E91E63] transition-all"><Facebook className="w-4 h-4" /></button>
                <button className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-[#E91E63] transition-all"><Twitter className="w-4 h-4" /></button>
                <button className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-[#E91E63] transition-all"><Linkedin className="w-4 h-4" /></button>
             </div>
          </div>

          {/* Footer Links */}
          <div className="flex gap-6 text-xs font-bold text-slate-300">
             <a href="#" className="hover:text-white">Privacy Policy</a>
             <a href="#" className="hover:text-white">Contact</a>
             <span>© 2026 PearlDesign</span>
          </div>
        </div>

        {/* --- RIGHT SIDE (Pink Form) --- */}
        <div className="w-full md:w-1/2 bg-[#E91E63] p-12 flex flex-col justify-center text-white relative">
            
            <div className="md:hidden flex items-center gap-2 mb-8">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg"><Scissors className="w-6 h-6 text-[#E91E63]" /></div>
                 <h1 className="text-2xl font-black">Pearl</h1>
            </div>

            <h2 className="text-3xl font-bold mb-2">Welcome to Pearl</h2>
            <p className="text-pink-100 mb-10 text-sm">Sign in by entering information below</p>

            <div className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-pink-200 uppercase mb-2">Email / Username *</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-4 rounded-xl bg-white text-slate-800 font-bold outline-none border-2 border-transparent focus:border-pink-300 transition-all placeholder:font-normal placeholder:text-slate-400"
                        placeholder="demo@example.com"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-pink-200 uppercase mb-2">Password *</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 rounded-xl bg-white text-slate-800 font-bold outline-none border-2 border-transparent focus:border-pink-300 transition-all placeholder:font-normal placeholder:text-slate-400"
                        placeholder="••••••"
                    />
                </div>

                <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" id="remember" className="w-4 h-4 accent-white bg-white/20 rounded border-none cursor-pointer" />
                    <label htmlFor="remember" className="text-sm font-medium text-pink-100 cursor-pointer select-none">Remember my preference</label>
                </div>
            </div>

            {error && <div className="mt-6 p-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm font-bold flex items-center gap-2 animate-pulse"><CheckCircle2 className="w-4 h-4"/> {error}</div>}

            <button 
                onClick={handleLogin} 
                disabled={loading}
                className="w-full mt-8 bg-white text-[#E91E63] py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-pink-50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5"/> : 'Sign In'}
            </button>

            <p className="mt-8 text-center text-sm text-pink-100">
                Don't have an account? <span className="font-bold text-white underline cursor-pointer hover:text-pink-50">Sign up</span>
            </p>

        </div>
      </div>
    </div>
  );
}