'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { generateInvoice } from '@/lib/invoiceGenerator';
import { 
  Scissors, LayoutDashboard, ShoppingBag, Users, Settings, 
  LogOut, Bell, Search, Menu, TrendingUp, 
  AlertTriangle, CheckCircle2, Clock, Printer, X, Wallet, FileEdit, ChevronDown,
  MessageSquare, List
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function Dashboard() {
  const router = useRouter(); 
  const [orders, setOrders] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ totalOrders: 0, pending: 0, ready: 0, revenue: 0 });

  useEffect(() => { fetchDashboardData(); }, []);

  async function fetchDashboardData() {
    try {
      const { data: orderData } = await supabase
        .from('orders')
        .select(`id, status, delivery_date, is_urgent, total_amount, advance_amount, payment_method, garment_type, fabric_details, customers (name, mobile)`)
        .order('created_at', { ascending: false });

      const { data: stockData } = await supabase.from('inventory').select('name, stock_remaining').lt('stock_remaining', 10).limit(5);
      
      setOrders(orderData || []);
      setLowStockItems(stockData || []);
      
      const total = orderData?.length || 0;
      const pending = orderData?.filter(o => o.status !== 'Delivered').length || 0;
      const ready = orderData?.filter(o => o.status === 'Ready for Delivery').length || 0;
      const revenue = orderData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;

      setStats({ totalOrders: total, pending, ready, revenue });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  const updateStatus = async (orderId: number, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    fetchDashboardData();
  };

  const handlePrintBill = (order: any) => {
    let desc = order.garment_type || "Tailoring Service";
    if (order.fabric_details) desc += ` - ${order.fabric_details}`;

    generateInvoice({
      orderId: order.id,
      customerName: order.customers.name,
      mobile: order.customers.mobile,
      date: new Date().toISOString(),
      items: [{ description: desc, quantity: 1, price: order.total_amount || 0 }],
      total: order.total_amount || 0,
      advance: order.advance_amount || 0
    });
  };

  // Pink Theme Status Colors
  const getStatusColor = (status: string) => {
    const map: any = {
      'Order Received': 'bg-blue-50 text-blue-600',
      'Cutting': 'bg-pink-50 text-pink-600',
      'Stitching': 'bg-purple-50 text-purple-600',
      'Buttoning': 'bg-orange-50 text-orange-600',
      'Ironing': 'bg-yellow-50 text-yellow-600',
      'Ready for Delivery': 'bg-emerald-50 text-emerald-600',
      'Delivered': 'bg-gray-50 text-gray-400 decoration-line-through',
    };
    return map[status] || 'bg-gray-50 text-gray-500';
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
        <Sidebar active="Dashboard" isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* SIDEBAR - PINK GRADIENT */}
      {/* <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#E91E63] to-[#C2185B] text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 shadow-xl`}> */}
        {/* <div className="p-6 flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Scissors className="w-6 h-6 text-[#E91E63]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Pearl Tailor</h1>
            <button className="md:hidden ml-auto text-white/80" onClick={() => setSidebarOpen(false)}><X /></button>
        </div> */}

        {/* <div className="px-4 space-y-1">
            <div className="px-4 py-2 mb-2">
                <div className="bg-white text-[#E91E63] flex items-center justify-between px-4 py-3 rounded-xl shadow-md cursor-pointer hover:scale-105 transition-transform" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <span className="font-bold text-sm">Dashboard</span>
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div> */

            /* <p className="px-5 text-[10px] font-bold text-pink-200 uppercase tracking-widest mt-6 mb-2">Menu</p>
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
            <SidebarItem icon={ShoppingBag} label="Order" href="/new-order" />      Creates New Order
            <SidebarItem icon={List} label="Order List" href="/orders" />     Views All Orders
            <SidebarItem icon={Users} label="Customer List" href="/customers" />
            <SidebarItem icon={LayoutDashboard} label="Inventory" href="/inventory" />
            
            <p className="px-5 text-[10px] font-bold text-pink-200 uppercase tracking-widest mt-6 mb-2">Apps</p>
            <SidebarItem icon={Wallet} label="Billing" href="/billing" />
            <SidebarItem icon={Settings} label="Settings" href="/admin" /> 
            
            <button onClick={() => router.push('/login')} className="w-full text-left mt-8 px-4">
                <div className="flex items-center gap-3 px-5 py-3 rounded-lg transition-all text-pink-100 hover:bg-white/10 hover:text-white group">
                    <LogOut className="w-5 h-5" /> <span className="font-medium text-sm">Logout</span>
                </div>
            </button>
        </div> */}
      

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#F3F4F6]">
        
        {/* TOP HEADER */}
        <Header title="Dashboard" setSidebarOpen={setSidebarOpen} />
        {/* CONTENT SCROLL */}
        <div className="flex-1 overflow-y-auto p-8">
            
            {/* STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Revenue */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-3xl font-bold text-slate-800">₹{stats.revenue.toLocaleString()}</h3>
                            <p className="text-sm font-medium text-slate-400 mt-1">Revenue</p>
                        </div>
                        <div className="p-2 bg-pink-50 text-pink-500 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
                    </div>
                    {/* Fake Chart Line (CSS) */}
                    <div className="h-10 w-full flex items-end gap-1 opacity-50">
                        {[40, 60, 30, 70, 50, 80, 40, 60, 90, 50].map((h, i) => (
                            <div key={i} className="flex-1 bg-pink-400 rounded-t-sm" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>

                {/* Orders */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-3xl font-bold text-slate-800">{stats.totalOrders}</h3>
                            <p className="text-sm font-medium text-slate-400 mt-1">Total Orders</p>
                        </div>
                        <div className="p-2 bg-pink-50 text-pink-500 rounded-lg"><ShoppingBag className="w-6 h-6" /></div>
                    </div>
                    <div className="h-10 w-full flex items-end gap-1 opacity-50">
                        {[20, 40, 60, 40, 50, 30, 60, 80, 50, 70].map((h, i) => (
                            <div key={i} className="flex-1 bg-purple-400 rounded-t-sm" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>

                {/* Customers */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-3xl font-bold text-slate-800">{stats.pending}</h3>
                            <p className="text-sm font-medium text-slate-400 mt-1">Pending</p>
                        </div>
                        <div className="p-2 bg-pink-50 text-pink-500 rounded-lg"><Clock className="w-6 h-6" /></div>
                    </div>
                    <div className="h-10 w-full flex items-end gap-1 opacity-50">
                        {[50, 30, 40, 60, 80, 50, 40, 30, 60, 40].map((h, i) => (
                            <div key={i} className="flex-1 bg-orange-400 rounded-t-sm" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>

                {/* Ready */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-3xl font-bold text-slate-800">{stats.ready}</h3>
                            <p className="text-sm font-medium text-slate-400 mt-1">Ready</p>
                        </div>
                        <div className="p-2 bg-pink-50 text-pink-500 rounded-lg"><CheckCircle2 className="w-6 h-6" /></div>
                    </div>
                    <div className="h-10 w-full flex items-end gap-1 opacity-50">
                        {[60, 70, 50, 40, 60, 80, 70, 50, 60, 80].map((h, i) => (
                            <div key={i} className="flex-1 bg-emerald-400 rounded-t-sm" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BIG CHART AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Chart Simulation */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">Revenue</h3>
                            <p className="text-xs text-slate-400">Monthly income overview</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-white border rounded-full text-xs font-bold text-slate-500 shadow-sm cursor-pointer hover:bg-slate-50">Monthly</span>
                        </div>
                    </div>
                    <div className="h-64 w-full bg-linear-to-t from-pink-50 to-transparent relative flex items-end justify-between px-4 pb-0 border-b border-slate-100">
                        {/* Fake Wave Chart */}
                        <svg viewBox="0 0 100 25" className="absolute bottom-0 left-0 right-0 w-full h-full" preserveAspectRatio="none">
                            <path d="M0,25 C20,10 40,25 60,5 C80,20 100,0 L100,25 Z" fill="#FCE4EC" fillOpacity="0.5" />
                            <path d="M0,25 C10,20 30,15 50,20 C70,25 90,5 100,10 L100,25 Z" fill="#F8BBD0" fillOpacity="0.5" />
                            <path d="M0,25 Q50,5 100,25" stroke="#E91E63" strokeWidth="0.5" fill="none" />
                        </svg>
                        <div className="z-10 text-center w-full absolute bottom-4 text-xs font-bold text-slate-400 flex justify-between px-8">
                            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                        </div>
                    </div>
                </div>

                {/* Low Stock / Quick Action */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800">Quick Actions</h3>
                    </div>
                    <button 
                        onClick={() => router.push('/new-order')} 
                        className="w-full mb-4 bg-[#E91E63] hover:bg-[#D81B60] text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <ShoppingBag className="w-5 h-5" /> New Order
                    </button>
                    
                    <h4 className="font-bold text-sm text-slate-700 mb-4 mt-6">Low Stock Alert</h4>
                    <ul className="space-y-3">
                        {lowStockItems.length > 0 ? lowStockItems.map((item, i) => (
                            <li key={i} className="flex justify-between items-center text-sm p-3 bg-red-50 rounded-lg border border-red-100">
                                <span className="font-medium text-red-800">{item.name}</span>
                                <span className="font-bold text-red-600">{item.stock_remaining}m</span>
                            </li>
                        )) : <p className="text-xs text-slate-400">Inventory looks good!</p>}
                    </ul>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-lg">Recent Workflow</h3>
                    <button onClick={() => router.push('/orders')} className="text-xs font-bold text-pink-500 hover:text-pink-600">View All</button>
                </div>
                
                {loading ? <div className="p-12 text-center text-slate-400">Loading data...</div> : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="p-5 border-b border-slate-100">ID</th>
                                <th className="p-5 border-b border-slate-100">Customer</th>
                                <th className="p-5 border-b border-slate-100">Details</th>
                                <th className="p-5 border-b border-slate-100">Deadline</th>
                                <th className="p-5 border-b border-slate-100">Amount</th>
                                <th className="p-5 border-b border-slate-100">Status</th>
                                <th className="p-5 border-b border-slate-100 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-pink-50/30 transition-colors">
                                    <td className="p-5 font-bold text-[#E91E63]">#{order.id}</td>
                                    <td className="p-5">
                                        <div className="font-bold text-slate-800">{order.customers?.name}</div>
                                        <div className="text-xs text-slate-500">{order.customers?.mobile}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="font-bold text-slate-700">{order.garment_type || 'Custom'}</div>
                                        <div className="text-xs text-slate-500">{order.fabric_details || '-'}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className={`font-bold flex items-center gap-1 ${order.is_urgent ? 'text-red-500' : 'text-slate-500'}`}>
                                            {order.is_urgent && <AlertTriangle className="w-3 h-3" />}
                                            {new Date(order.delivery_date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-5 font-bold text-slate-800">₹{order.total_amount || 0}</td>
                                    <td className="p-5"><span className={`px-3 py-1 rounded-md text-xs font-bold ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                    <td className="p-5 text-right flex justify-end gap-2">
                                        <select 
                                            className="text-xs font-medium bg-white border border-slate-200 rounded-md py-1.5 px-2 outline-none focus:ring-1 focus:ring-pink-500 text-slate-600 cursor-pointer"
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                        >
                                            <option>Order Received</option><option>Cutting</option><option>Stitching</option><option>Buttoning</option><option>Ironing</option><option>Ready for Delivery</option><option disabled>──</option><option>Delivered</option>
                                        </select>
                                        <button onClick={() => handlePrintBill(order)} className="p-1.5 bg-slate-50 rounded-md text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-all"><Printer className="w-4 h-4" /></button>
                                        <Link href={`/orders/${order.id}`}><button className="p-1.5 bg-slate-50 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all mx-1"><FileEdit className="w-4 h-4" /></button></Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}