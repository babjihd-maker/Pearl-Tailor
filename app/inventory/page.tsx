'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { 
  Search, Plus, Package, AlertTriangle, TrendingUp, 
  Box, Trash2, X, Loader2, Save, UploadCloud, Edit3
} from 'lucide-react';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({ 
    name: '', 
    category: 'Cotton', 
    price_per_meter: '', 
    stock_remaining: '', 
    description: '',
    image_url: '' 
  });

  // Stats
  const [stats, setStats] = useState({ total: 0, inStock: 0, outStock: 0, totalValue: 0 });

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    const { data } = await supabase.from('inventory').select('*').order('id', { ascending: true });
    if (data) {
      setItems(data);
      calculateStats(data);
    }
    setLoading(false);
  };

  const calculateStats = (data: any[]) => {
      const total = data.length;
      const inStock = data.filter(i => i.stock_remaining > 0).length;
      const outStock = data.filter(i => i.stock_remaining <= 0).length;
      const totalValue = data.reduce((sum, i) => sum + ((i.price_per_meter || 0) * i.stock_remaining), 0);
      setStats({ total, inStock, outStock, totalValue });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      const file = e.target.files[0];
      const fileName = `fabric-${Math.random()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('inventory').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('inventory').getPublicUrl(fileName);
      setFormData({ ...formData, image_url: publicUrl });
    } catch (error: any) { alert('Upload error: ' + error.message); } 
    finally { setUploading(false); }
  };

  const openAddModal = () => {
      setEditingId(null);
      setFormData({ name: '', category: 'Cotton', price_per_meter: '', stock_remaining: '', description: '', image_url: '' });
      setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
      setEditingId(item.id);
      setFormData({
          name: item.name,
          category: item.category || 'Cotton',
          price_per_meter: item.price_per_meter,
          stock_remaining: item.stock_remaining,
          description: item.description || '',
          image_url: item.image_url || ''
      });
      setIsModalOpen(true);
  };

  const handleSave = async () => {
     if (!formData.name || !formData.price_per_meter || !formData.stock_remaining) return alert("Fill required fields");
     setSaving(true);
     try {
         const payload = {
             name: formData.name,
             category: formData.category,
             type: 'Fabric',
             price_per_meter: parseFloat(formData.price_per_meter),
             stock_remaining: parseFloat(formData.stock_remaining),
             description: formData.description,
             image_url: formData.image_url || 'https://via.placeholder.com/150'
         };

         if (editingId) {
             // UPDATE
             const { error } = await supabase.from('inventory').update(payload).eq('id', editingId);
             if (error) throw error;
             alert("✅ Updated Successfully!");
         } else {
             // INSERT
             const { error } = await supabase.from('inventory').insert([payload]);
             if (error) throw error;
             alert("✅ Added Successfully!");
         }

         setIsModalOpen(false);
         fetchInventory();
     } catch (err: any) { alert("Error: " + err.message); } 
     finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
      if (!confirm("Are you sure you want to delete this item?")) return;
      await supabase.from('inventory').delete().eq('id', id);
      fetchInventory();
  };

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const inputClass = "w-full p-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:border-[#E91E63] outline-none text-slate-700 font-bold";
  const labelClass = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2";

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans text-slate-600">
      <Sidebar active="Inventory" isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#F3F4F6]">
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-8 z-10 sticky top-0">
             <h2 className="text-2xl font-black text-slate-800">Inventory</h2>
            <div className="flex items-center gap-4">
                <div className="relative w-64 hidden md:block"><Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" /><input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border-none rounded-full text-sm font-bold outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
                <button onClick={openAddModal} className="bg-[#E91E63] text-white px-4 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-[#D81B60] shadow-lg shadow-pink-200 transition-all text-sm"><Plus className="w-4 h-4" /> Add Item</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center"><div><p className="text-xs font-bold text-slate-400 uppercase mb-1">Total</p><h3 className="text-3xl font-black text-slate-800">{stats.total}</h3></div><div className="bg-pink-50 p-3 rounded-xl text-[#E91E63]"><Package/></div></div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center"><div><p className="text-xs font-bold text-slate-400 uppercase mb-1">In Stock</p><h3 className="text-3xl font-black text-slate-800">{stats.inStock}</h3></div><div className="bg-emerald-50 p-3 rounded-xl text-emerald-500"><Box/></div></div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center"><div><p className="text-xs font-bold text-slate-400 uppercase mb-1">Low Stock</p><h3 className="text-3xl font-black text-slate-800">{stats.outStock}</h3></div><div className="bg-red-50 p-3 rounded-xl text-red-500"><AlertTriangle/></div></div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center"><div><p className="text-xs font-bold text-slate-400 uppercase mb-1">Value</p><h3 className="text-3xl font-black text-slate-800">₹{(stats.totalValue/1000).toFixed(1)}k</h3></div><div className="bg-blue-50 p-3 rounded-xl text-blue-500"><TrendingUp/></div></div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F9FAFB] text-slate-500 text-xs uppercase font-bold tracking-wider"><tr><th className="p-6">ID</th><th className="p-6">Item</th><th className="p-6">Category</th><th className="p-6">Price</th><th className="p-6">Stock</th><th className="p-6 text-center">Action</th></tr></thead>
                        <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-600">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-pink-50/20 transition-colors">
                                    <td className="p-6 font-bold text-[#E91E63]">#{item.id}</td>
                                    <td className="p-6 flex items-center gap-3"><img src={item.image_url} className="w-10 h-10 rounded-lg object-cover bg-slate-100"/>{item.name}</td>
                                    <td className="p-6">{item.category}</td>
                                    <td className="p-6">₹{item.price_per_meter}</td>
                                    <td className="p-6">{item.stock_remaining}m</td>
                                    <td className="p-6 text-center flex justify-center gap-2">
                                        <button onClick={() => openEditModal(item)} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50"><Edit3 className="w-4 h-4"/></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </main>

      {/* MODAL (ADD / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-[#E91E63] p-6 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2">{editingId ? <Edit3 className="w-5 h-5"/> : <Plus className="w-5 h-5"/>} {editingId ? 'Edit Item' : 'Add Item'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white"><X/></button>
                </div>
                <div className="p-8 space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className="relative w-32 h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-[#E91E63] hover:text-[#E91E63] overflow-hidden" onClick={() => fileInputRef.current?.click()}>
                            {formData.image_url ? <img src={formData.image_url} className="w-full h-full object-cover" /> : (uploading ? <Loader2 className="animate-spin"/> : <UploadCloud className="w-8 h-8"/>)}
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*"/>
                        </div>
                    </div>
                    <div><label className={labelClass}>Name</label><input type="text" className={inputClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                         <div><label className={labelClass}>Stock (m)</label><input type="number" className={inputClass} value={formData.stock_remaining} onChange={e => setFormData({...formData, stock_remaining: e.target.value})} /></div>
                         <div><label className={labelClass}>Price (₹)</label><input type="number" className={inputClass} value={formData.price_per_meter} onChange={e => setFormData({...formData, price_per_meter: e.target.value})} /></div>
                    </div>
                    <button onClick={handleSave} disabled={saving} className="w-full mt-4 bg-[#E91E63] hover:bg-[#D81B60] text-white py-3 rounded-xl font-bold shadow-lg shadow-pink-200 flex items-center justify-center gap-2">{saving ? <Loader2 className="animate-spin"/> : <Save className="w-5 h-5"/>} {editingId ? 'Update Item' : 'Save Item'}</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}