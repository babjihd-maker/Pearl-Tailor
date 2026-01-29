'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  User, Ruler, Calculator, Scissors, Shirt, Wallet, Search, Menu, 
  LayoutDashboard, ShoppingBag, List, Users, Settings, LogOut, X, ArrowLeft
} from 'lucide-react';
import { calculateClothRequirement, BodyType, ClothType, getReasoning } from '@/lib/calculations';
import { generateMeasurementSheet } from '@/lib/invoiceGenerator';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SingleVoiceInput from '@/components/SingleVoiceInput';
import Sidebar from '@/components/Sidebar';

// 1. We create the main content component
function NewOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ Get URL Parameters

  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // STATE
  const [customer, setCustomer] = useState({ id: null as number|null, name: '', mobile: '', gender: 'Male', age: '' });
  const [measurements, setMeasurements] = useState({ 
    chest: '', waist: '', shirt_length: '', pant_length: '', 
    shoulder: '', sleeve_length: '', neck: '', hip: '', 
    inseam: '', thigh: '', arm_hole: '', bicep: '',
    knee: '', calf: '', ankle: '', notes: '' 
  });
  
  const [garmentDetails, setGarmentDetails] = useState({ type: 'Shirt', fabric: '' });
  const [aiResult, setAiResult] = useState<{meters: string, reason: string} | null>(null);
  const [selectedClothType, setSelectedClothType] = useState<ClothType>('Shirt');
  const [bodyType, setBodyType] = useState<BodyType>('Normal');
  const [approxHeight, setApproxHeight] = useState<string>('5.8');
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [payment, setPayment] = useState({ total: '', advance: '', method: 'Cash' });

  // ✅ NEW: Auto-fill Fabric & Price from Shop
  useEffect(() => {
    const fabricName = searchParams.get('fabricName');
    const price = searchParams.get('price');

    if (fabricName) {
        setGarmentDetails(prev => ({ ...prev, fabric: fabricName }));
    }
    if (price) {
        // We assume 2 meters for a standard shirt/pant to estimate initial price, 
        // or just set it as a base. You can edit this logic.
        // For now, let's just pre-fill the fabric price as a starting point.
        // setPayment(prev => ({ ...prev, total: price })); 
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchStock = async () => { const { data } = await supabase.from('inventory').select('*').gt('stock_remaining', 0); if (data) setInventoryItems(data); }; fetchStock();
  }, []);

  const handleSearchCustomer = async (mobileInput: string) => {
    if (mobileInput.length !== 10) { if (customer.id) setCustomer(prev => ({ ...prev, id: null })); return; }
    try {
        const { data: custData } = await supabase.from('customers').select('*').eq('mobile', mobileInput).single();
        if (custData) {
            setCustomer({ id: custData.id, name: custData.name, mobile: custData.mobile, gender: custData.gender, age: custData.age.toString() });
        } 
    } catch {}
  };

  const handleCalculateAi = () => { 
      const h = parseFloat(approxHeight); 
      if (!h) return alert("Height needed"); 
      setAiResult({ 
          meters: calculateClothRequirement(selectedClothType, { heightFt: h, chest: parseFloat(measurements.chest)||40, waist: parseFloat(measurements.waist)||32, bodyType }), 
          reason: getReasoning(selectedClothType, { heightFt: h, chest: parseFloat(measurements.chest)||40, waist: parseFloat(measurements.waist)||32, bodyType }) 
      }); 
  };

  const handleSubmit = async () => {
    if (!payment.total) return alert("Please enter Total Bill amount");
    setLoading(true);
    try {
      let customerId = customer.id;
      if (!customerId) {
          const { data: custData, error } = await supabase.from('customers').insert([{ name: customer.name, mobile: customer.mobile, gender: customer.gender, age: parseInt(customer.age)||0 }]).select().single();
          if (error && error.code === '23505') { const { data: existing } = await supabase.from('customers').select('id').eq('mobile', customer.mobile).single(); if(existing) customerId = existing.id; } 
          else if (error) throw error; else customerId = custData.id;
      } else { await supabase.from('customers').update({ name: customer.name, age: parseInt(customer.age)||0 }).eq('id', customerId); }

      const { data: orderData, error: orderError } = await supabase.from('orders').insert([{ 
          customer_id: customerId, delivery_date: new Date(Date.now() + 7 * 86400000), 
          total_amount: parseFloat(payment.total), advance_amount: parseFloat(payment.advance)||0, payment_method: payment.method,
          garment_type: garmentDetails.type, fabric_details: garmentDetails.fabric
      }]).select().single();
      
      if (orderError) throw orderError;
      
      await supabase.from('measurements').insert([{ 
          order_id: orderData.id, ...measurements,
          chest: parseFloat(measurements.chest)||0, waist: parseFloat(measurements.waist)||0 
      }]);
      
      generateMeasurementSheet({
          orderId: orderData.id, customerName: customer.name, garmentType: garmentDetails.type,
          fabricDetails: garmentDetails.fabric, measurements: measurements
      });
      
      alert('✅ Order Saved! Downloading Cutting Sheet...');
      // Clear params after save
      router.push('/new-order');
      window.location.reload();
    } catch (err: any) { alert('❌ Error: ' + err.message); } finally { setLoading(false); }
  };

  const inputClass = "w-full p-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] outline-none text-slate-700 font-bold transition-all pr-10";
  const labelClass = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2";
  const cardClass = "bg-white p-8 rounded-3xl shadow-sm border border-slate-100";

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans text-slate-600">
      <Sidebar active="Order" isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#F3F4F6]">
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-8 z-10">
             <div className="flex items-center gap-4">
                <button className="md:hidden text-slate-500" onClick={() => setSidebarOpen(true)}><Menu /></button>
                <h2 className="text-xl font-bold text-slate-800">Create Order</h2>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-8">
                    {/* CUSTOMER */}
                    <div className={cardClass}>
                        <div className="flex items-center gap-2 mb-6 text-[#E91E63]"><User className="w-5 h-5" /><h2 className="text-xl font-bold text-slate-800">Customer</h2></div>
                        <div className="space-y-5">
                            <div><label className={labelClass}>Mobile</label><div className="relative"><input type="tel" className={`${inputClass} font-mono`} placeholder="9876543210" value={customer.mobile} onChange={e => { setCustomer({...customer, mobile: e.target.value}); handleSearchCustomer(e.target.value); }} /><Search className="absolute right-3 top-3.5 w-5 h-5 text-slate-400" /></div></div>
                            <div><label className={labelClass}>Name</label><input type="text" className={inputClass} placeholder="Full Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelClass}>Gender</label><select className={inputClass} value={customer.gender} onChange={e => setCustomer({...customer, gender: e.target.value})}><option>Male</option><option>Female</option></select></div>
                                <div><label className={labelClass}>Age</label><input type="number" className={inputClass} placeholder="30" value={customer.age} onChange={e => setCustomer({...customer, age: e.target.value})} /></div>
                            </div>
                        </div>
                    </div>

                    {/* GARMENT */}
                    <div className={cardClass}>
                        <div className="flex items-center gap-2 mb-6 text-[#E91E63]"><Shirt className="w-5 h-5" /><h2 className="text-xl font-bold text-slate-800">Garment</h2></div>
                        <div className="space-y-5">
                            <div><label className={labelClass}>Type</label><div className="grid grid-cols-3 gap-2">{['Shirt', 'Pant', 'Kurta', 'Suit', 'Dress'].map(type => (<button key={type} onClick={() => setGarmentDetails({...garmentDetails, type})} className={`p-3 rounded-xl text-sm font-bold border transition-all ${garmentDetails.type === type ? 'bg-[#E91E63] text-white border-[#E91E63]' : 'bg-white border-slate-200 text-slate-500 hover:border-[#E91E63]'}`}>{type}</button>))}</div></div>
                            <div><label className={labelClass}>Fabric Details</label><input type="text" className={inputClass} placeholder="e.g. Blue Cotton" value={garmentDetails.fabric} onChange={e => setGarmentDetails({...garmentDetails, fabric: e.target.value})} /></div>
                        </div>
                    </div>

                    {/* MEASUREMENTS */}
                    <div className={cardClass}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2 text-[#E91E63]"><Ruler className="w-5 h-5" /><h2 className="text-xl font-bold text-slate-800">Measurements</h2></div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.keys(measurements).filter(k=>k!=='notes').map((key) => (
                            <div key={key}>
                                <label className={labelClass}>{key.replace('_', ' ')}</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        className={inputClass} 
                                        placeholder="0.0" 
                                        value={(measurements as any)[key]} 
                                        onChange={e => setMeasurements({...measurements, [key]: e.target.value})} 
                                    />
                                    {/* MICROPHONE ICON */}
                                    <div className="absolute right-2 top-1.5">
                                        <SingleVoiceInput onResult={(val) => setMeasurements(prev => ({...prev, [key]: val}))} />
                                    </div>
                                </div>
                            </div>
                            ))}
                        </div>
                        <div className="mt-6"><label className={labelClass}>Notes</label><textarea className={inputClass} placeholder="Instructions..." value={measurements.notes} onChange={e => setMeasurements({...measurements, notes: e.target.value})} /></div>
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-8">
                    {/* AI CALCULATOR */}
                    <div className="bg-linear-to-br from-[#E91E63] to-[#C2185B] p-8 rounded-3xl text-white shadow-xl shadow-pink-200 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-6 relative z-10"><Calculator className="w-5 h-5 text-white" /><h2 className="text-xl font-bold">AI Estimator</h2></div>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <select className="bg-white/20 border border-white/30 rounded-xl p-3 text-white outline-none" value={selectedClothType} onChange={(e) => setSelectedClothType(e.target.value as ClothType)}><option className="text-slate-800">Shirt</option><option className="text-slate-800">Pant</option></select>
                            <input type="number" className="bg-white/20 border border-white/30 rounded-xl p-3 text-white placeholder-white/70 outline-none" placeholder="Height" value={approxHeight} onChange={(e) => setApproxHeight(e.target.value)} />
                        </div>
                        <button onClick={handleCalculateAi} className="w-full mt-4 bg-white text-[#E91E63] font-bold p-3 rounded-xl shadow-lg relative z-10">Calculate</button>
                        {aiResult && <div className="mt-4 text-3xl font-black text-white relative z-10">{aiResult.meters} Meters</div>}
                    </div>

                    {/* PAYMENT */}
                    <div className={cardClass}>
                        <div className="flex items-center gap-2 mb-6 text-[#E91E63]"><Wallet className="w-5 h-5" /><h2 className="text-xl font-bold text-slate-800">Payment</h2></div>
                        <div className="space-y-4">
                             <div><label className={labelClass}>Total Bill</label><input type="number" className={inputClass} placeholder="₹" value={payment.total} onChange={e => setPayment({...payment, total: e.target.value})} /></div>
                             <div><label className={labelClass}>Advance</label><input type="number" className={inputClass} placeholder="₹" value={payment.advance} onChange={e => setPayment({...payment, advance: e.target.value})} /></div>
                        </div>
                        <button onClick={handleSubmit} disabled={loading} className="w-full mt-6 bg-[#E91E63] hover:bg-[#D81B60] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-pink-200 transition-all">{loading ? 'Saving...' : 'Save Order'}</button>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}

// 2. Wrap it in Suspense to prevent build errors with searchParams
export default function NewOrderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#E91E63] font-bold">Loading Order...</div>}>
            <NewOrderContent />
        </Suspense>
    );
}