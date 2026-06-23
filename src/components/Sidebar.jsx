import React, { useState } from 'react';
import {
  Home,
  Box,
  Search,
  HelpCircle,
  PlusCircle,
  Zap,
  Folder,
  Calendar,
  ChevronRight,
  ChevronDown,
  Bell,
  ScanSearch,
  Bot,
  FileWarning,
  Globe2,
  MessageCircle,
} from 'lucide-react';

export default function Sidebar({ isOpen, closeSidebar, activeTab, setActiveTab, onHomeClick }) {
  const [agentMenuOpen, setAgentMenuOpen] = useState(true);

  const navItems = [
    { name: 'สืบรถใหม่',   icon: PlusCircle },
    { name: 'แชท',         icon: MessageCircle },
    { name: 'คดีที่บันทึก', icon: Folder },
  ];

  const agentItems = [
    { name: 'Clone Detector', key: 'CLONE_DETECTOR', icon: ScanSearch, color: 'text-violet-500', dot: 'bg-violet-400' },
    { name: 'Bot Hunter',     key: 'BOT_HUNTER',     icon: Bot,        color: 'text-rose-500',   dot: 'bg-rose-400' },
    { name: 'Doc',      key: 'DOC_FORGE',      icon: FileWarning,color: 'text-amber-500',  dot: 'bg-amber-400' },
    { name: 'Scraper',        key: 'SCRAPER',        icon: Globe2,     color: 'text-teal-500',   dot: 'bg-teal-400' },
  ];

  // Colors and labels for the social icons in "Connect IM channel"
  const socialIcons = [
    { name: 'WhatsApp', color: 'bg-emerald-500 text-white', icon: 'WA' },
    { name: 'Telegram', color: 'bg-sky-500 text-white', icon: 'TG' },
    { name: 'Discord', color: 'bg-indigo-600 text-white', icon: 'DC' },
    { name: 'Slack', color: 'bg-amber-400 text-slate-800', icon: 'SL' },
    { name: 'WeChat', color: 'bg-green-500 text-white', icon: 'WC' },
    { name: 'Line', color: 'bg-emerald-600 text-white', icon: 'LN' },
  ];

  const handleMobileNav = (target) => {
    setActiveTab(target);
    closeSidebar();
  };

  return (
    <>
      {/* ═════════ MOBILE — Dark Sidebar ═════════ */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="sm:hidden fixed inset-0 top-[61px] bg-black/60 backdrop-blur-sm z-30 cursor-pointer"
        />
      )}
      <div className={`sm:hidden fixed top-[61px] left-0 h-[calc(100vh-61px)] w-72 z-40 bg-[#0a0a0a] border-r border-[#1a1a1a] transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col p-5 h-full overflow-y-auto">
          <div className="space-y-1.5">
            <button
              onClick={() => { onHomeClick?.(); closeSidebar(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'แชท'
                  ? 'bg-[#1a1a1a] text-white border border-[#2a2a2a]'
                  : 'text-[#c2c2c2] hover:bg-[#141414]'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>หน้าหลัก / Chat</span>
            </button>
            <button
              onClick={() => handleMobileNav('คดีที่บันทึก')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#c2c2c2] hover:bg-[#141414] text-sm font-medium transition-all"
            >
              <Folder className="w-4 h-4" />
              <span>บันทึก</span>
            </button>
            <button
              onClick={() => handleMobileNav('TAKEDOWN')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'TAKEDOWN'
                  ? 'bg-[#1a1a1a] text-white border border-[#2a2a2a]'
                  : 'text-[#c2c2c2] hover:bg-[#141414]'
              }`}
            >
              <ScanSearch className="w-4 h-4 text-[#f9597b]" />
              <span>Takedown Dashboard</span>
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-[#f9597b]/15 text-[#f9597b] font-bold">DEMO</span>
            </button>
          </div>

          <div className="mt-6 mb-2 px-4">
            <span className="text-[11px] font-semibold text-[#666] uppercase tracking-wider">
              เครื่องมือแก้ชง
            </span>
          </div>
          <div className="space-y-1">
            {agentItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleMobileNav(item.key)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[#c2c2c2] hover:bg-[#141414] text-sm font-medium transition-all"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                  <Icon className="w-4 h-4 text-[#888]" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* ═════════ DESKTOP — Original Light Sidebar ═════════ */}
      <div className={`hidden sm:flex sm:fixed md:relative top-[61px] md:top-0 left-0 h-[calc(100vh-61px)] z-40 bg-slate-50 border-r border-slate-100 select-none transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
      
      {/* 1. Far Left Mini Rail (Icon Stack) */}
      <div className="flex flex-col items-center justify-between w-16 py-6 bg-white border-r border-slate-100">
        
        {/* Top Rail Stack */}
        <div className="flex flex-col items-center space-y-6 w-full">
          {/* Home Icon */}
          <button className="group relative p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-all duration-300 cursor-pointer">
            <Home className="w-5 h-5 fill-slate-800 text-slate-800" />
            <span className="absolute left-14 top-2 z-50 scale-0 transition-all rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:scale-100">
              Dashboard
            </span>
          </button>

          {/* Cube/Box Icon */}
          <button className="group relative p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all duration-300 cursor-pointer">
            <Box className="w-5 h-5" />
            <span className="absolute left-14 top-2 z-50 scale-0 transition-all rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:scale-100">
              Workspace
            </span>
          </button>

          {/* Alert Bell with "New" Badge overlay */}
          <div className="relative group">
            <button className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all duration-300 cursor-pointer">
              <Bell className="w-5 h-5" />
            </button>
            <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 bg-red-500 text-[8px] font-bold text-white uppercase tracking-wider rounded-sm animate-pulse">
              New
            </span>
            <span className="absolute left-14 top-2 z-50 scale-0 transition-all rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:scale-100">
              Notifications
            </span>
          </div>
        </div>

        {/* Bottom Rail Stack */}
        <div className="flex flex-col items-center space-y-6 w-full">
          {/* Search Icon */}
          <button className="group relative p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all duration-300 cursor-pointer">
            <Search className="w-5 h-5" />
            <span className="absolute left-14 top-2 z-50 scale-0 transition-all rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:scale-100">
              Quick Search
            </span>
          </button>

          {/* Help Icon */}
          <button className="group relative p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all duration-300 cursor-pointer">
            <HelpCircle className="w-5 h-5" />
            <span className="absolute left-14 top-2 z-50 scale-0 transition-all rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:scale-100">
              Support
            </span>
          </button>
        </div>

      </div>

      {/* 2. Main Navigation Panel */}
      <div className="flex flex-col justify-between w-60 p-4 bg-[#f8fafc]/50">
        
        {/* Navigation items list */}
        <div className="space-y-1.5">
          {/* สืบรถใหม่ — primary CTA */}
          <button
            onClick={() => setActiveTab('สืบรถใหม่')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl border cursor-pointer text-sm font-medium transition-all duration-300 mb-3 ${
              activeTab === 'สืบรถใหม่'
                ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
                : 'bg-white/40 border-slate-100 text-slate-600 hover:bg-white/80 hover:border-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            <span>สืบรถใหม่</span>
          </button>

          {/* Agent Tools Section */}
          <button
            onClick={() => setAgentMenuOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-2 cursor-pointer group"
          >
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-500 transition-colors">
              เครื่องมือแก้ชง
            </span>
            {agentMenuOpen
              ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            }
          </button>

          {agentMenuOpen && (
            <div className="space-y-0.5 pl-1">
              {agentItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => { setActiveTab(item.key); closeSidebar(); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-slate-100/80 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-100/40 hover:text-slate-800'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.dot}`} />
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? item.color : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Other nav items */}
          <div className="pt-1 space-y-0.5">
            {navItems.filter(n => n.name !== 'สืบรถใหม่').map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => { setActiveTab(item.name); closeSidebar(); }}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-100/70 text-slate-900 font-semibold'
                      : 'text-slate-500 hover:bg-slate-100/40 hover:text-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Connect IM Channel section */}
        <div className="bg-white border border-slate-100 rounded-xl p-3.5 hover:shadow-xs transition-all duration-300">
          <div className="flex items-center space-x-1.5 mb-2.5">
            {socialIcons.map((soc) => (
              <div 
                key={soc.name} 
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-extrabold ${soc.color} cursor-pointer hover:scale-115 transition-transform duration-200 shadow-2xs`}
                title={soc.name}
              >
                {soc.icon}
              </div>
            ))}
          </div>

          <button className="w-full flex items-center justify-between group cursor-pointer">
            <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
              Connect IM channel
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

      </div>

    </div>
    </>
  );
}
