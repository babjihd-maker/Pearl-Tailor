'use client';

import Link from 'next/link';
import { 
  Scissors, LayoutDashboard, ShoppingBag, List, Users, 
  Settings, LogOut, Wallet, X, Box 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  active: 'Dashboard' | 'Order' | 'Order List' | 'Customers' | 'Cloth Store' | 'Inventory' | 'Billing' | 'Settings';
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function Sidebar({ active, isOpen, setIsOpen }: SidebarProps) {
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Order', icon: ShoppingBag, href: '/new-order' },
    { name: 'Order List', icon: List, href: '/orders' },
    { name: 'Cloth Store', icon: ShoppingBag, href: '/shop' },
    // { name: 'Customer List', icon: Users, href: '/customers' },
    { name: 'Inventory', icon: Box, href: '/inventory' },
  ];

  const appItems = [
    { name: 'Billing', icon: Wallet, href: '/billing' },
    { name: 'Settings', icon: Settings, href: '/admin' },
  ];

  const SidebarItem = ({ item }: { item: any }) => {
    const isActive = active === item.name;
    return (
      <Link href={item.href} className="block mb-2">
        <div 
          className={`flex items-center gap-4 px-6 py-4 text-sm font-bold transition-all duration-300 ${
            isActive 
              ? 'bg-[#F3F4F6] text-[#E91E63] rounded-l-full ml-5 shadow-none' // ACTIVE: Matches page bg, Round Left, Flat Right
              : 'text-pink-100 hover:bg-white/10 rounded-xl mx-4' // INACTIVE: Floating, smaller, transparent
          }`}
        >
          <item.icon 
            className={`w-5 h-5 transition-transform duration-300 ${
              isActive ? 'text-[#E91E63] scale-110' : 'text-pink-200 group-hover:text-white'
            }`} 
          />
          <span className="tracking-wide">{item.name}</span>
          
          {/* Optional: Add a small chevron or dot for active state if you like */}
          {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E91E63]" />}
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-linear-to-b from-[#E91E63] via-[#D81B60] to-[#AD1457] text-white transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 shadow-2xl flex flex-col`}
      >
        {/* Header */}
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter drop-shadow-md">Pearl Tailor</h1>
          </div>
          <button className="md:hidden text-white/80 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Menu Area */}
        {/* Note: pr-0 removes right padding so active tab touches the edge */}
        <div className="flex-1 overflow-y-auto py-2 space-y-8 no-scrollbar pr-0">
          
          {/* Main Menu Group */}
          <div>
            <p className="px-8 text-[11px] font-extrabold text-pink-200/70 uppercase tracking-[0.2em] mb-4">Main Menu</p>
            <div>
              {menuItems.map((item) => (
                <SidebarItem key={item.name} item={item} />
              ))}
            </div>
          </div>

          {/* Apps Group */}
          <div>
            <p className="px-8 text-[11px] font-extrabold text-pink-200/70 uppercase tracking-[0.2em] mb-4">Apps</p>
            <div>
              {appItems.map((item) => (
                <SidebarItem key={item.name} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer / Logout */}
        <div className="p-6 mt-auto">
          <button 
            onClick={() => router.push('/login')} 
            className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 text-pink-100 bg-black/20 hover:bg-black/30 hover:text-white group border border-white/5"
          >
            <LogOut className="w-5 h-5 group-hover:text-pink-200 transition-colors" /> 
            <span className="font-bold text-sm">Logout Account</span>
          </button>
        </div>
      </aside>
    </>
  );
}