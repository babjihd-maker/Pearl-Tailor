'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { 
  Save, Ruler, ArrowLeft, Loader2, IndianRupee, FileEdit, Shirt, X 
} from 'lucide-react';
import Link from 'next/link';

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customerName, setCustomerName] = useState('');
  
  // All Measurements State
  const [measurements, setMeasurements] = useState({ 
    chest: '', waist: '', shirt_length: '', pant_length: '', 
    shoulder: '', sleeve_length: '', neck: '', hip: '', 
    inseam: '', thigh: '', arm_hole: '', bicep: '',
    knee: '', calf: '', ankle: '', notes: '' 
  });
  
  const [payment, setPayment] = useState({ total: '', advance: '' });
  const [garmentDetails, setGarmentDetails] = useState({ type: 'Shirt', fabric: '' });

  useEffect(() => {
    if (!orderId) return;
    const fetch = async () => {
      const { data: order } = await supabase.from('orders').select(`*, customers (name), measurements (*)`).eq('id', orderId).single();
      if (order) {
        setCustomerName(order.customers?.name || 'Unknown');
        setPayment({ total: order.total_amount, advance: order.advance_amount });
        setGarmentDetails({ type: order.garment_type || 'Shirt', fabric: order.fabric_details || '' });
        if (order.measurements?.[0]) {
           // Load existing measurements
           const m = order.measurements[0];
           const newM: any = { ...measurements };
           Object.keys(newM).forEach(key => { if (m[key]) newM[key] = m[key]; });
           setMeasurements(newM);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [orderId]);

  const handleUpdate = async () => {
    setSaving(true);
    await supabase.from('orders').update({ 
        total_amount: parseFloat(payment.total), 
        advance_amount: parseFloat(payment.advance),
        garment_type: garmentDetails.type,
        fabric_details: garmentDetails.fabric
    }).eq('id', orderId);

    await supabase.from('measurements').update({
        ...measurements,
        chest: parseFloat(measurements.chest)||0, waist: parseFloat(measurements.waist)||0, // ensure numbers
        notes: measurements.notes
    }).eq('order_id', orderId);

    alert('✅ Updated!');
    setSaving(false);
    router.push(`/orders/${orderId}`); // Go back to View Page
  };

  const inputClass = "w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-pink-500 outline-none font-bold text-slate-700";
  const labelClass = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2";

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6 font-sans text-slate-600">
      <div className="max-w-4xl mx-auto mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 font-bold mb-4 hover:text-pink-500"><ArrowLeft className="w-4 h-4"/> Cancel & Go Back</button>
        <h1 className="text-3xl font-black text-slate-800">Edit Order #{orderId}</h1>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="space-y-6">
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-6 text-[#E91E63]"><Shirt className="w-5 h-5" /><h2 className="text-xl font-bold text-slate-800">Garment</h2></div>
                <div className="space-y-4">
                    <div><label className={labelClass}>Type</label><select className={inputClass} value={garmentDetails.type} onChange={e => setGarmentDetails({...garmentDetails, type: e.target.value})}><option>Shirt</option><option>Pant</option><option>Kurta</option><option>Suit</option><option>Dress</option></select></div>
                    <div><label className={labelClass}>Fabric</label><input type="text" className={inputClass} value={garmentDetails.fabric} onChange={e => setGarmentDetails({...garmentDetails, fabric: e.target.value})} /></div>
                </div>
             </div>

             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-6 text-[#E91E63]"><Ruler className="w-5 h-5" /><h2 className="text-xl font-bold text-slate-800">Measurements</h2></div>
                <div className="grid grid-cols-2 gap-4">
                    {Object.keys(measurements).filter(k => k !== 'notes').map((key) => (
                        <div key={key}>
                            <label className={labelClass}>{key.replace('_', ' ')}</label>
                            <input type="number" className={inputClass} value={(measurements as any)[key]} onChange={e => setMeasurements({...measurements, [key]: e.target.value})} />
                        </div>
                    ))}
                </div>
                <div className="mt-4"><label className={labelClass}>Notes</label><textarea className={inputClass} value={measurements.notes} onChange={e => setMeasurements({...measurements, notes: e.target.value})} /></div>
             </div>
         </div>

         <div className="space-y-6">
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Billing</h2>
                <div className="space-y-4">
                    <div><label className={labelClass}>Total</label><input type="number" className={inputClass} value={payment.total} onChange={e => setPayment({...payment, total: e.target.value})} /></div>
                    <div><label className={labelClass}>Advance</label><input type="number" className={inputClass} value={payment.advance} onChange={e => setPayment({...payment, advance: e.target.value})} /></div>
                </div>
             </div>
             <button onClick={handleUpdate} disabled={saving} className="w-full bg-[#E91E63] hover:bg-[#D81B60] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-pink-200 transition-all">
                {saving ? 'Saving...' : 'Save Changes'}
             </button>
         </div>
      </div>
    </div>
  );
}