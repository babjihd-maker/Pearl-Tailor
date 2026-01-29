'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Scissors, LayoutDashboard, ShoppingBag, Users, Settings, 
  Wallet, Search, Menu, Calendar, ChevronLeft, ChevronRight, MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function OrderListPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, customers (name, mobile)`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  // Status Badge Logic
  const getStatusStyle = (status: string) => {
    if (status === 'Delivered') return 'bg-green-100 text-green-600';
    if (status === 'Cancelled') return 'bg-red-100 text-red-600';
    if (status === 'Ready for Delivery') return 'bg-blue-100 text-blue-600';
    return 'bg-orange-100 text-orange-600'; 
  };

  // Filter Logic
  const filteredOrders = orders.filter(order => 
    order.customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm)
  );

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
      <Sidebar active="Order List" isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* SIDEBAR (Pink Theme) */}
      {/* <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#E91E63] to-[#C2185B] text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 shadow-xl`}>
        <div className="p-6 flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Scissors className="w-6 h-6 text-[#E91E63]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Koki</h1>
            <button className="md:hidden ml-auto text-white/80" onClick={() => setSidebarOpen(false)}><Menu /></button>
        </div>

        <div className="px-4 space-y-1">
            <p className="px-5 text-[10px] font-bold text-pink-200 uppercase tracking-widest mt-6 mb-2">Menu</p>
            <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
            <SidebarItem icon={ShoppingBag} label="Order" href="/new-order" />
            <SidebarItem icon={LayoutDashboard} label="Order List" href="/orders" active /> Active Page
            <SidebarItem icon={Users} label="Customer List" href="/customers" />
            <SidebarItem icon={Wallet} label="Billing" href="/billing" />
            <SidebarItem icon={Settings} label="Settings" href="/admin" />
        </div>
      </aside> */}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#F3F4F6]">
        
        {/* HEADER */}
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-8 z-10 sticky top-0">
             <div className="flex items-center gap-4">
                <button className="md:hidden text-slate-500" onClick={() => setSidebarOpen(true)}><Menu /></button>
                <h2 className="text-2xl font-black text-slate-800">Order List</h2>
            </div>
            <div className="flex items-center gap-3">
                 <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-400 font-medium">Good Morning</p>
                    <p className="text-sm font-bold text-slate-800">Master Tailor</p>
                </div>
                <div className="w-10 h-10 bg-slate-300 rounded-full overflow-hidden border-2 border-white shadow-sm">
                     <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">MT</div>
                </div>
            </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
            
            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by ID or Name..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border-none rounded-full text-sm font-medium focus:ring-2 focus:ring-pink-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <button className="flex items-center gap-2 px-6 py-2.5 border border-pink-500 text-pink-500 rounded-full font-bold text-sm hover:bg-pink-50 transition-colors">
                    <Calendar className="w-4 h-4" /> Today
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? <div className="p-12 text-center text-slate-400">Loading orders...</div> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white text-slate-800 text-xs uppercase font-black tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="p-6">Order ID</th>
                                <th className="p-6">Date</th>
                                <th className="p-6">Customer Name</th>
                                <th className="p-6">Details</th>
                                <th className="p-6">Amount</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-600">
                            {filteredOrders.map((order) => (
                                <tr 
                                    key={order.id} 
                                    className="hover:bg-pink-50/30 transition-colors group cursor-pointer" 
                                    onClick={() => router.push(`/orders/${order.id}`)}
                                >
                                    <td className="p-6 text-[#E91E63] font-bold">#{order.id}</td>
                                    <td className="p-6">
                                        <div>{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                        <div className="text-xs text-slate-400 mt-1">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="p-6 text-slate-800 font-bold">{order.customers?.name}</td>
                                    <td className="p-6 text-slate-500">{order.garment_type}</td>
                                    <td className="p-6 font-bold text-slate-800">₹{order.total_amount}</td>
                                    <td className="p-6">
                                        <span className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wide ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-[#E91E63]">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                )}
                
                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 flex justify-between items-center">
                    <p className="text-xs text-slate-400 font-bold">Showing {filteredOrders.length} entries</p>
                    <div className="flex gap-2">
                         <button className="p-2 border rounded-lg text-slate-400 hover:bg-slate-50"><ChevronLeft className="w-4 h-4"/></button>
                         <button className="p-2 border rounded-lg text-slate-400 hover:bg-slate-50"><ChevronRight className="w-4 h-4"/></button>
                    </div>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}