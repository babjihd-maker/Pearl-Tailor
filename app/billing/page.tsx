'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Scissors, LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Wallet, Search, Menu, List, CheckCircle2, TrendingUp, AlertCircle, X, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function BillingPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ totalSales: 0, collected: 0, pending: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useEffect(() => { fetchBillingData(); }, []);

  async function fetchBillingData() {
      const { data } = await supabase.from('orders').select('id, total_amount, advance_amount, status, created_at, customers(name, mobile)').order('created_at', { ascending: false });
      if (data) {
        setInvoices(data);
        const total = data.reduce((sum, item) => sum + (item.total_amount || 0), 0);
        const collected = data.reduce((sum, item) => sum + (item.advance_amount || 0), 0);
        setStats({ totalSales: total, collected, pending: total - collected });
      }
  }

  const handleSettlePayment = async () => {
    if (!selectedInvoice) return;
    await supabase.from('orders').update({ advance_amount: selectedInvoice.total_amount, status: 'Delivered' }).eq('id', selectedInvoice.id);
    setSelectedInvoice(null);
    fetchBillingData();
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
        <Sidebar active="Billing" isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

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
            <SidebarItem icon={Wallet} label="Billing" active />
            <SidebarItem icon={Settings} label="Settings" href="/admin" />
            <button onClick={() => router.push('/login')} className="w-full text-left mt-8 px-4">
                <div className="flex items-center gap-3 px-5 py-3 rounded-lg transition-all text-pink-100 hover:bg-white/10 hover:text-white group"><LogOut className="w-5 h-5" /> <span className="font-medium text-sm">Logout</span></div>
            </button>
        </div>
      </aside> */}

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#F3F4F6]">
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-8 z-10"><div className="flex items-center gap-4"><button className="md:hidden text-slate-500" onClick={() => setSidebarOpen(true)}><Menu /></button><h2 className="text-xl font-bold text-slate-800">Billing & Finance</h2></div></header>
        
        <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><div className="flex justify-between items-start mb-4"><div><h3 className="text-3xl font-bold text-slate-800">₹{stats.totalSales.toLocaleString()}</h3><p className="text-sm font-medium text-slate-400 mt-1">Total Sales</p></div><div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><TrendingUp className="w-6 h-6" /></div></div></div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><div className="flex justify-between items-start mb-4"><div><h3 className="text-3xl font-bold text-slate-800">₹{stats.collected.toLocaleString()}</h3><p className="text-sm font-medium text-slate-400 mt-1">Collected</p></div><div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><CheckCircle2 className="w-6 h-6" /></div></div></div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><div className="flex justify-between items-start mb-4"><div><h3 className="text-3xl font-bold text-slate-800">₹{stats.pending.toLocaleString()}</h3><p className="text-sm font-medium text-slate-400 mt-1">Pending Dues</p></div><div className="p-2 bg-red-50 text-red-500 rounded-lg"><AlertCircle className="w-6 h-6" /></div></div></div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-slate-800 text-lg">Transactions</h3></div>
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider"><tr><th className="p-5">ID</th><th className="p-5">Customer</th><th className="p-5">Bill</th><th className="p-5">Paid</th><th className="p-5">Due</th><th className="p-5 text-center">Action</th></tr></thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {invoices.map((inv) => {
                            const due = inv.total_amount - inv.advance_amount;
                            return (
                                <tr key={inv.id} className="hover:bg-slate-50">
                                    <td className="p-5 font-bold text-[#E91E63]">#{inv.id}</td>
                                    <td className="p-5 font-bold text-slate-800">{inv.customers?.name}</td>
                                    <td className="p-5">₹{inv.total_amount}</td>
                                    <td className="p-5 text-emerald-600 font-bold">₹{inv.advance_amount}</td>
                                    <td className="p-5"><span className={due > 0 ? 'text-red-500 font-bold' : 'text-slate-400'}>{due > 0 ? `₹${due}` : '-'}</span></td>
                                    <td className="p-5 text-center">{due > 0 ? <button onClick={() => setSelectedInvoice(inv)} className="bg-[#E91E63] text-white px-4 py-2 rounded-lg text-xs font-bold shadow hover:bg-[#D81B60]">Collect</button> : <span className="text-emerald-600 font-bold text-xs">PAID</span>}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center relative">
                <button onClick={() => setSelectedInvoice(null)} className="absolute top-4 right-4 text-slate-400"><X className="w-6 h-6"/></button>
                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#E91E63]"><Wallet className="w-8 h-8" /></div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Collect Payment</h3>
                <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100 mt-4"><div className="flex justify-between text-xl font-black text-slate-800"><span>Collect Now</span><span>₹{selectedInvoice.total_amount - selectedInvoice.advance_amount}</span></div></div>
                <button onClick={handleSettlePayment} className="w-full bg-[#E91E63] hover:bg-[#D81B60] text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-pink-200">Confirm & Mark Delivered</button>
            </div>
        </div>
      )}
      </main>
    </div>
  );
}