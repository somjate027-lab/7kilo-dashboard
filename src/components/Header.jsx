import React from 'react';
import { Menu, Bell, Smartphone, Monitor, Coins, VolumeX, MessageSquarePlus, MessageSquare, Image } from 'lucide-react';
import { LOGO_DATA_URL } from '../constants/logo';

export default function Header({ toggleSidebar, isSidebarOpen, user, onLoginClick, onLogoutClick }) {
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

        {/* Mobile Brand Label (Kimi Mockup) */}
        <div className="flex items-center md:hidden select-none">
          <span className="text-[14px] font-semibold text-slate-200">@7กิโล๊ะ.com</span>
        </div>

        {/* Desktop Brand Label */}
        <div className="hidden sm:flex items-center space-x-2 cursor-pointer group">
          {/* 7กิโล๊ะ Logo */}
          <img
            src={LOGO_DATA_URL}
            alt="7กิโล๊ะ"
            className="w-8 h-8 md:w-9 md:h-9 rounded-lg object-contain transition-transform group-hover:scale-110 duration-300"
          />
          <span className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 bg-clip-text text-transparent">
            7กิโล๊ะ
          </span>
        </div>
      </div>

      {/* Right side: Controls & User Profile */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Mobile Kimi Icons */}
        <div className="flex md:hidden items-center space-x-5 text-[#8a8a8a] pr-2">
          <VolumeX className="w-[22px] h-[22px] cursor-pointer hover:text-slate-300" strokeWidth={1.5} />
          <MessageSquarePlus className="w-[22px] h-[22px] cursor-pointer hover:text-slate-300" strokeWidth={1.5} />
          <button onClick={() => alert('Chat feature coming soon!')} className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-white/10 rounded-full transition-colors cursor-pointer" aria-label="เปิดแชท">
            <MessageSquare className="w-[22px] h-[22px]" />
          </button>
          <button onClick={() => window.open('https://www.google.com/search?tbm=isch&q=' + encodeURIComponent('รูปโคลน'), '_blank')} className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-white/10 rounded-full transition-colors cursor-pointer" aria-label="ค้นหารูปโคลน">
            <Image className="w-[22px] h-[22px]" />
          </button>
        </div>

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
          /* Logged-in: show avatar + dropdown */
          <div className="relative cursor-pointer group">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="User avatar"
                className="w-8 h-8 rounded-full border border-slate-200 object-cover ring-2 ring-transparent group-hover:ring-violet-500/30 transition-all duration-300"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent group-hover:ring-violet-500/30 transition-all duration-300">
                {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-100 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 py-1 text-slate-700 text-xs z-50">
              <div className="px-4 py-2 border-b border-slate-50">
                <p className="font-semibold text-slate-800 truncate">{user.user_metadata?.full_name || '7กิโล๊ะ Member'}</p>
                <p className="text-slate-400 truncate">{user.email}</p>
              </div>
              <button onClick={onLogoutClick} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-red-500">ออกจากระบบ</button>
            </div>
          </div>
        ) : (
          /* Guest: show Login button */
          <button
            onClick={onLoginClick}
            className="px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer bg-white text-slate-900 active:scale-95 sm:text-white sm:bg-gradient-to-r sm:from-blue-600 sm:to-cyan-500 sm:hover:from-blue-700 sm:hover:to-cyan-600 sm:shadow-md"
          >
            เข้าสู่ระบบ
          </button>
        )}
      </div>
    </header>
  );
}
