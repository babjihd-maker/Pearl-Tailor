'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Phone, MapPin, CheckCircle2, 
  Scissors, Printer, ChevronDown, User, MessageSquare, Edit3
} from 'lucide-react';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [measurements, setMeasurements] = useState<any>(null);
  
  // Status Management
  const [currentStatus, setCurrentStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, customers (*), measurements (*)`)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
      setCurrentStatus(data.status);
      if (data.measurements && data.measurements.length > 0) {
        setMeasurements(data.measurements[0]);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    setCurrentStatus(newStatus);
    setIsUpdating(false);
  };

  const getProgressStep = (status: string) => {
    if (['Order Received'].includes(status)) return 1;
    if (['Cutting', 'Stitching', 'Buttoning', 'Ironing'].includes(status)) return 2;
    if (['Ready for Delivery'].includes(status)) return 3;
    if (['Delivered'].includes(status)) return 4;
    return 1;
  };

  const currentStep = getProgressStep(currentStatus);

  if (loading || !order) return <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] text-pink-500 font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6 font-sans text-slate-600">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-pink-500 font-bold mb-2 hover:underline">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-black text-slate-800">Order ID #{order.id}</h1>
        </div>
        
        <div className="flex items-center gap-3">
             {/* ✅ NEW: EDIT BUTTON */}
             <button 
                onClick={() => router.push(`/orders/${orderId}/edit`)} // <--- Navigate to Edit Page
                className="bg-white text-slate-600 px-6 py-3 rounded-full font-bold shadow-sm border border-slate-200 flex items-center gap-2 hover:bg-slate-50 transition-all"
             >
                <Edit3 className="w-4 h-4"/> Edit Details
             </button>

             {/* Status Dropdown */}
            <div className="relative group">
                <button className="bg-[#E91E63] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-pink-200 flex items-center gap-2 hover:bg-[#D81B60] transition-all">
                    {isUpdating ? '...' : currentStatus} <ChevronDown className="w-4 h-4"/>
                </button>
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hidden group-hover:block z-50">
                    {['Order Received', 'Cutting', 'Stitching', 'Ready for Delivery', 'Delivered'].map((s) => (
                        <button key={s} onClick={() => handleUpdateStatus(s)} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-pink-50 hover:text-pink-600">{s}</button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* ... (Keep the rest of your VIEW CARD code here, Timeline, Map etc.) ... */}
      {/* Use the code from the previous "Pink Theme" response for the rest of the page */}
       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="relative">
                    <div className="absolute top-4 left-0 w-full h-1 bg-slate-100 rounded-full"></div>
                    <div className="absolute top-4 left-0 h-1 bg-[#E91E63] rounded-full transition-all duration-1000" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>
                    <div className="relative flex justify-between">
                        {['Order Placed', 'In Production', 'Ready', 'Delivered'].map((step, i) => (
                            <div key={step} className="flex flex-col items-center gap-4">
                                <div className={`w-9 h-9 rounded-full border-4 flex items-center justify-center z-10 bg-white ${currentStep >= i + 1 ? 'border-[#E91E63]' : 'border-slate-200'}`}>
                                    {currentStep >= i + 1 && <div className="w-3 h-3 rounded-full bg-[#E91E63]"></div>}
                                </div>
                                <p className="font-bold text-sm text-slate-800">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Visualizer Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-pink-50 rounded-xl text-[#E91E63]"><Scissors className="w-6 h-6"/></div>
                    <div><h3 className="text-xl font-black text-slate-800">{order.garment_type}</h3><p className="text-sm text-slate-500">{order.fabric_details}</p></div>
                 </div>
                 <div className="grid grid-cols-4 gap-4">
                    {measurements && Object.entries(measurements).filter(([k,v]) => v && v!==0 && !['id','created_at','order_id','notes'].includes(k)).map(([k,v]) => (
                        <div key={k} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-[10px] uppercase font-bold text-slate-400">{k.replace('_',' ')}</p>
                            <p className="text-lg font-black text-slate-800">{String(v)}</p>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
                <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full mb-4 flex items-center justify-center text-slate-400"><User className="w-8 h-8"/></div>
                <h3 className="text-xl font-black text-slate-800">{order.customers?.name}</h3>
                <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 font-bold"><Phone className="w-4 h-4"/> {order.customers?.mobile}</div>
            </div>
            <div className="bg-[#E91E63] p-6 rounded-3xl text-white shadow-lg shadow-pink-200">
                <p className="text-pink-100 font-bold text-sm">Total Amount</p>
                <h3 className="text-3xl font-black">₹{order.total_amount}</h3>
            </div>
        </div>
       </div>
    </div>
  );
}