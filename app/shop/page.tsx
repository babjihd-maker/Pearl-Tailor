'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Search, ShoppingBag, Sparkles } from 'lucide-react';

export default function ShopPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    const { data } = await supabase.from('inventory').select('*').gt('stock_remaining', 0);
    if (data) setItems(data);
    setLoading(false);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || (item.category || 'General') === category;
    return matchesSearch && matchesCategory;
  });

  const handleSelectFabric = (item: any) => {
    const params = new URLSearchParams();
    params.set('fabricName', item.name);
    params.set('price', item.price_per_meter);
    router.push(`/new-order?${params.toString()}`);
  };

  const categories = ['All', 'Cotton', 'Silk', 'Linen', 'Wool'];

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans text-slate-600">
      
      {/* ✅ FIXED: Active is now "Cloth Store" */}
      <Sidebar active="Cloth Store" isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#F3F4F6]">
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-8 z-10 sticky top-0">
             <h2 className="text-2xl font-black text-slate-800">Cloth Store</h2>
             <div className="relative w-64 md:w-96 hidden md:block">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input type="text" placeholder="Search fabrics..." className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border-none rounded-full text-sm font-bold outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
            {/* BANNER */}
            <div className="bg-linear-to-r from-[#E91E63] to-[#C2185B] rounded-3xl p-8 mb-8 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black mb-2">Premium Fabrics</h1>
                    <p className="text-pink-100 font-medium mb-6">Select a fabric to start stitching immediately.</p>
                </div>
            </div>

            {/* CATEGORIES */}
            <div className="flex gap-3 overflow-x-auto pb-6">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)} className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${category === cat ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>{cat}</button>
                ))}
            </div>

            {/* GRID */}
            {loading ? <div className="text-center p-12">Loading...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-xl transition-all group flex flex-col h-full">
                            <div className="h-48 rounded-xl bg-slate-100 overflow-hidden mb-4 relative">
                                <img src={item.image_url || 'https://via.placeholder.com/300'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-black text-slate-800">{item.stock_remaining}m Left</div>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2"><h3 className="font-bold text-slate-800 text-lg">{item.name}</h3><p className="font-black text-[#E91E63]">₹{item.price_per_meter || 0}<span className="text-xs text-slate-400">/m</span></p></div>
                                <button onClick={() => handleSelectFabric(item)} className="mt-auto w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-[#E91E63] transition-colors"><ShoppingBag className="w-4 h-4" /> Select Fabric</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </main>
    </div>
  );
}