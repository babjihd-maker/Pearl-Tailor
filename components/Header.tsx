'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, MessageSquare, Menu, Camera, X, Save, Loader2, User } from 'lucide-react';

interface HeaderProps {
  title: string;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ title, setSidebarOpen }: HeaderProps) {
  // Profile State
  const [profile, setProfile] = useState({ name: 'Master Tailor', avatar_url: null as string | null });
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  // 1. Fetch current profile data
  const fetchProfile = async () => {
    const { data } = await supabase.from('admin_profile').select('*').eq('id', 1).single();
    if (data) {
      setProfile(data);
      setEditName(data.name);
    }
    setLoading(false);
  };

  // 2. Handle Image Upload to Storage bucket
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('You must select an image to upload.');

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `admin-avatar-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to 'avatars' bucket
      let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update state (not saved to DB yet)
      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (error: any) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // 3. Save Changes to Database
  const saveProfile = async () => {
    setUploading(true);
    const { error } = await supabase.from('admin_profile').update({
        name: editName,
        avatar_url: profile.avatar_url
    }).eq('id', 1);

    if (error) {
        alert('Error saving profile');
    } else {
        setProfile({ ...profile, name: editName });
        setIsModalOpen(false);
    }
    setUploading(false);
  };


  return (
    <>
      <header className="h-20 bg-white shadow-sm flex items-center justify-between px-8 z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <button className="md:hidden text-slate-500" onClick={() => setSidebarOpen(true)}><Menu /></button>
          <h2 className="text-xl font-bold text-slate-800 hidden md:block">{title}</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Icons */}
          <button className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-pink-50 hover:text-pink-500 transition relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">12</span>
          </button>
          <button className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-pink-50 hover:text-pink-500 transition relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">5</span>
          </button>

          {/* Profile Section - Clickable to open Modal */}
          <div 
            className="flex items-center gap-3 pl-4 border-l border-slate-100 cursor-pointer group"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="text-right hidden md:block">
              <p className="text-xs text-slate-400 font-medium">Good Morning</p>
              <p className="text-sm font-bold text-slate-800 group-hover:text-[#E91E63] transition">{loading ? '...' : profile.name}</p>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm group-hover:border-[#E91E63] transition relative bg-slate-200">
              {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400"><User className="w-5 h-5"/></div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ---- EDIT PROFILE MODAL ---- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-[#E91E63] p-6 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold">Edit Profile</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white"><X/></button>
                </div>
                <div className="p-8 flex flex-col items-center">
                    
                    {/* Image Upload */}
                    <div className="relative mb-6 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 shadow-md relative bg-slate-100">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300"><User className="w-12 h-12"/></div>
                            )}
                            {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="text-white animate-spin"/></div>}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-[#E91E63] p-2 rounded-full text-white border-2 border-white group-hover:scale-110 transition"><Camera className="w-4 h-4"/></div>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} hidden />
                    </div>

                    {/* Name Input */}
                    <div className="w-full mb-6">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                        <input 
                            type="text" 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full p-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] outline-none text-slate-700 font-bold"
                        />
                    </div>

                    <button 
                        onClick={saveProfile} 
                        disabled={uploading}
                        className="w-full bg-[#E91E63] hover:bg-[#D81B60] text-white py-3 rounded-xl font-bold shadow-lg shadow-pink-200 flex items-center justify-center gap-2"
                    >
                        {uploading ? <Loader2 className="animate-spin"/> : <Save className="w-5 h-5"/>} Save Changes
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}