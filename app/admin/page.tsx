'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Scissors, LayoutDashboard, ShoppingBag, List, Users, Settings, LogOut, Wallet, Menu, Save } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useTheme } from '@/components/ThemeProvider';
import { redirect } from 'next/navigation';



export default function AdminPage() {
  const router = useRouter();
  const [config, setConfig] = useState({ shopName: '', address: '', phone: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => { const { data } = await supabase.from('app_config').select('*').single(); if (data) setConfig(data); };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    await supabase.from('app_config').upsert({ id: 1, ...config });
    alert('✅ Settings Saved!');
  };

  const SidebarItem = ({ icon: Icon, label, href, active }: any) => (
    <Link href={href || '#'}>
       <div className={`flex items-center gap-3 px-5 py-3 rounded-lg transition-all duration-200 group ${active ? 'bg-white/20 text-white' : 'text-pink-100 hover:bg-white/10 hover:text-white'}`}>
        <Icon className="w-5 h-5" />
        <span className="font-medium text-sm tracking-wide">{label}</span>
       </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans text-slate-600">
        <Sidebar active="Settings" isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#E91E63] to-[#C2185B] text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 shadow-xl`}>
        <div className="p-6 flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg"><Scissors className="w-6 h-6 text-[#E91E63]" /></div>
            <h1 className="text-2xl font-bold tracking-tight">Koki</h1>
            <button className="md:hidden ml-auto text-white/80" onClick={() => setSidebarOpen(false)}><Menu /></button>
        </div>
        <div className="px-4 space-y-1">
            <p className="px-5 text-[10px] font-bold text-pink-200 uppercase tracking-widest mt-6 mb-2">Menu</p>
            <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
            <SidebarItem icon={ShoppingBag} label="Order" href="/new-order" />
            <SidebarItem icon={List} label="Order List" href="/orders" />
            <SidebarItem icon={Users} label="Customer List" href="/customers" />
            <SidebarItem icon={LayoutDashboard} label="Inventory" href="/inventory" />
            <p className="px-5 text-[10px] font-bold text-pink-200 uppercase tracking-widest mt-6 mb-2">Apps</p>
            <SidebarItem icon={Wallet} label="Billing" href="/billing" />
            <SidebarItem icon={Settings} label="Settings" active />
            <button onClick={() => router.push('/login')} className="w-full text-left mt-8 px-4">
                <div className="flex items-center gap-3 px-5 py-3 rounded-lg transition-all text-pink-100 hover:bg-white/10 hover:text-white group"><LogOut className="w-5 h-5" /> <span className="font-medium text-sm">Logout</span></div>
            </button>
        </div>
      </aside> */}

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#F3F4F6]">
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-8 z-10"><div className="flex items-center gap-4"><button className="md:hidden text-slate-500" onClick={() => setSidebarOpen(true)}><Menu /></button><h2 className="text-xl font-bold text-slate-800">Settings</h2></div></header>
        
        <div className="flex-1 overflow-y-auto p-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-2xl">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Shop Configuration</h3>
                <div className="space-y-5">
                    <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Shop Name</label><input type="text" className="w-full p-3 bg-[#F9FAFB] border border-slate-200 rounded-xl outline-none focus:border-[#E91E63]" value={config.shopName} onChange={e => setConfig({...config, shopName: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Address</label><input type="text" className="w-full p-3 bg-[#F9FAFB] border border-slate-200 rounded-xl outline-none focus:border-[#E91E63]" value={config.address} onChange={e => setConfig({...config, address: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Phone</label><input type="text" className="w-full p-3 bg-[#F9FAFB] border border-slate-200 rounded-xl outline-none focus:border-[#E91E63]" value={config.phone} onChange={e => setConfig({...config, phone: e.target.value})} /></div>
                </div>
                <button onClick={handleSave} className="mt-8 bg-[#E91E63] hover:bg-[#D81B60] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-pink-200 flex items-center gap-2"><Save className="w-5 h-5"/> Save Settings</button>
            </div>
        </div>
      </main>
    </div>
  );
}