'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Search, Phone, ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetch = async () => { const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false }); setCustomers(data || []); };
    fetch();
  }, []);

  const filtered = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.mobile.includes(searchTerm));

  return (
    <div className="min-h-screen bg-[#0F172A] p-8 font-sans text-slate-200">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
           <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-purple-400 mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
           </Link>
           <h1 className="text-3xl font-black text-white flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-500" /> Customer Directory
           </h1>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-slate-800/50 backdrop-blur-md p-2 rounded-2xl shadow-xl shadow-slate-900/50 border border-slate-700/50 mb-8 flex items-center gap-4 sticky top-4 z-10">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><Search className="w-5 h-5" /></div>
            <input 
                type="text" 
                placeholder="Search by Name or Mobile Number..." 
                className="flex-1 outline-none text-slate-200 bg-transparent text-lg font-medium placeholder-slate-500" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
        </div>

        {/* TABLE CARD */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-xl shadow-slate-900/50 overflow-hidden backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold tracking-wider">
                <tr><th className="p-5">Profile</th><th className="p-5">Contact</th><th className="p-5">Info</th><th className="p-5">Joined</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
                {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-900/50 border border-white/10">
                            {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-bold text-slate-200">{c.name}</div>
                            <div className="text-xs text-slate-500 font-mono">ID: #{c.id}</div>
                        </div>
                    </div>
                    </td>
                    <td className="p-5">
                        <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
                            <Phone className="w-4 h-4 text-slate-600" /> {c.mobile}
                        </div>
                    </td>
                    <td className="p-5">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold mr-2 ${c.gender === 'Male' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'}`}>
                            {c.gender}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{c.age} Yrs</span>
                    </td>
                    <td className="p-5 text-slate-500 text-xs font-bold flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> {new Date(c.created_at).toLocaleDateString()}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            {filtered.length === 0 && <div className="p-12 text-center text-slate-500 font-medium">No customers found.</div>}
        </div>
      </div>
    </div>
  );
}