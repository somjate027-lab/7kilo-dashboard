import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Smartphone, Monitor, Coins, MessageSquare, Image } from 'lucide-react';
import { LOGO_DATA_URL } from '../constants/logo';

export default function Header({ toggleSidebar, isSidebarOpen, user, onLoginClick, onLogoutClick, onHomeClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // ปิดเมนูเมื่อแตะ/คลิกข้างนอก (รองรับทั้งมือถือ + เดสก์ท็อป)
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-3 bg-[#0a0a0a] sm:bg-white/80 backdrop-blur-md border-b-0 sm:border-b border-white/0 sm:border-slate-100 shadow-xs">
      {/* Left side: Logo & Toggle */}
      <div className="flex items-center space-x-2">
        {/* Toggle Hamburger Button on Mobile */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-slate-400 sm:text-slate-500 hover:text-slate-200 sm:hover:text-slate-800 hover:bg-white/10 sm:hover:bg-slate-100 rounded-lg transition-colors cursor-pointer md:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile wordmark — tap to go home */}
        <button
          onClick={onHomeClick}
          className="sm:hidden text-[16px] font-bold text-[#f9597b] cursor-pointer"
          style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.02em' }}
          aria-label="กลับหน้าหลัก"
        >
          7kilo<span className="animate-cursor-blink">_</span>
        </button>

        {/* Desktop Brand Label — clickable home */}
        <button onClick={onHomeClick} className="hidden sm:flex items-center space-x-2 cursor-pointer group" aria-label="กลับหน้าหลัก">
          {/* 7กิโล๊ะ Logo */}
          <img
            src={LOGO_DATA_URL}
            alt="7กิโล๊ะ"
            className="w-8 h-8 md:w-9 md:h-9 rounded-lg object-contain transition-transform group-hover:scale-110 duration-300"
          />
          <span className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 bg-clip-text text-transparent">
            7กิโล๊ะ
          </span>
        </button>
      </div>

      {/* Right side: Controls & User Profile */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Device Mode Icons (Hidden on mobile) */}
        <div className="hidden sm:flex items-center space-x-1.5 p-1 bg-slate-50 border border-slate-100 rounded-lg">
          <button className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-all cursor-pointer">
            <Smartphone className="w-4 h-4" />
          </button>
          <button className="flex items-center space-x-1 px-2 py-1 bg-white shadow-xs border border-slate-150 rounded-md text-xs font-medium text-slate-700">
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button onClick={() => alert('Chat feature coming soon!')} className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-all cursor-pointer" aria-label="เปิดแชท">
            <MessageSquare className="w-4 h-4" />
          </button>
          <button onClick={() => window.open('https://www.google.com/search?tbm=isch&q=' + encodeURIComponent('รูปโคลน'), '_blank')} className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-all cursor-pointer" aria-label="ค้นหารูปโคลน">
            <Image className="w-4 h-4" />
          </button>
        </div>

        {/* Notification Bell — แสดงเฉพาะตอน login */}
        {user && (
          <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-full transition-colors cursor-pointer">
            <Bell className="w-5 h-5" />
          </button>
        )}

        {/* Credit Indicator — แสดงเฉพาะตอน login */}
        {user && (
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-orange-50/50 border border-orange-100/60 rounded-full">
            <Coins className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="text-xs font-semibold text-slate-700">Free</span>
          </div>
        )}

        {/* Login / User Profile */}
        {user ? (
          /* Logged-in: show avatar + dropdown (แตะเปิด/ปิด) */
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="block rounded-full cursor-pointer"
              aria-label="เมนูผู้ใช้"
              aria-expanded={menuOpen}
            >
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="User avatar"
                  className={`w-8 h-8 rounded-full border border-slate-200 object-cover ring-2 transition-all duration-300 ${menuOpen ? 'ring-violet-500/30' : 'ring-transparent'}`}
                />
              ) : (
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold ring-2 transition-all duration-300 ${menuOpen ? 'ring-violet-500/30' : 'ring-transparent'}`}>
                  {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
            </button>
            <div className={`absolute right-0 top-full mt-2 w-52 bg-white border border-slate-100 rounded-xl shadow-lg transition-opacity duration-200 py-1 text-slate-700 text-xs z-50 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
              <div className="px-4 py-2 border-b border-slate-50">
                <p className="font-semibold text-slate-800 truncate">{user.user_metadata?.full_name || '7กิโล๊ะ Member'}</p>
                <p className="text-slate-400 truncate">{user.email}</p>
              </div>
              <button onClick={() => { setMenuOpen(false); onLogoutClick(); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-red-500 cursor-pointer">ออกจากระบบ</button>
            </div>
          </div>
        ) : (
          /* Guest: show Login button */
          <button
            onClick={onLoginClick}
            className="px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer bg-transparent text-[#c2c2c2] border border-[#2a2a2a] hover:text-white hover:border-[#f9597b] active:scale-95 sm:bg-gradient-to-r sm:from-blue-600 sm:to-cyan-500 sm:text-white sm:border-0 sm:hover:from-blue-700 sm:hover:to-cyan-600 sm:shadow-md"
          >
            เข้าสู่ระบบ
          </button>
        )}
      </div>
    </header>
  );
}
