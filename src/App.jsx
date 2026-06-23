import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import AgentPage from './components/AgentPage';
import LandingPage from './components/LandingPage';
import LoginModal from './components/LoginModal';
import CasesPage from './components/CasesPage';
import TakedownDashboard from './components/TakedownDashboard';
import { agentConfigs } from './agents/agentConfigs';
import { onAuthChange, signOut } from './utils/supabaseAuth';

const AGENT_KEYS = ['CLONE_DETECTOR', 'BOT_HUNTER', 'DOC_FORGE', 'SCRAPER'];

function App() {
  const [isSidebarOpen, setIsSidebarOpen]   = useState(false);
  const [activeTab, setActiveTab]           = useState('แชท');
  const [user, setUser]                     = useState(null);   // null = guest
  const [showLogin, setShowLogin]           = useState(false);
  const [newChatSignal, setNewChatSignal]   = useState(0);      // bump → MainContent reset

  // pendingHandoff: { agentKey, messages[] }
  // บันทึกก่อน login → restore หลัง login
  const pendingHandoff = useRef(null);

  // Listen for auth state changes (login / logout / OAuth redirect)
  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);

      if (authUser) {
        setShowLogin(false);

        // มี handoff รอ? → navigate ไป agent แล้วส่ง messages ที่บันทึกไว้
        if (pendingHandoff.current) {
          const { agentKey } = pendingHandoff.current;
          setActiveTab(agentKey);
          // pendingHandoff.current จะถูก AgentPage อ่านผ่าน prop แล้ว clear
        }
      }
    });
    return unsubscribe;
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar  = () => setIsSidebarOpen(false);

  // กลับหน้าหลัก/เริ่มแชทใหม่ — เรียกจาก logo, sidebar "แชท"
  const goHome = () => {
    if (activeTab === 'แชท') {
      setNewChatSignal(n => n + 1);   // อยู่หน้าแชทอยู่แล้ว → reset chat
    } else {
      setActiveTab('แชท');             // อยู่หน้าอื่น → กลับมาหน้าแชท
    }
    setIsSidebarOpen(false);
  };

  // เรียกจาก MainContent เมื่อ CENTER detect agent แต่ user ยังไม่ login
  // messages = รายการบทสนทนาที่คุยมาแล้ว (ส่ง draft ไปยัง AgentPage)
  const requestLogin = (agentKey, messages = []) => {
    pendingHandoff.current = { agentKey, messages };
    setShowLogin(true);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
    pendingHandoff.current = null;
  };

  const renderContent = () => {
    if (activeTab === 'สืบรถใหม่')   return <LandingPage setActiveTab={setActiveTab} />;
    if (activeTab === 'คดีที่บันทึก') return <CasesPage user={user} setActiveTab={setActiveTab} />;
    if (activeTab === 'TAKEDOWN')     return <TakedownDashboard />;
    if (activeTab === 'คดีสำเร็จ')   return <CasesPage user={user} setActiveTab={setActiveTab} />;
    if (activeTab === 'แชท')         return (
      <MainContent
        user={user}
        requestLogin={requestLogin}
        newChatSignal={newChatSignal}
      />
    );
    if (AGENT_KEYS.includes(activeTab)) {
      // ดึง handoff messages ถ้ามี แล้ว clear ทันที (render ครั้งเดียว)
      const handoff = pendingHandoff.current;
      const initialMessages = (handoff?.agentKey === activeTab) ? handoff.messages : [];
      if (handoff?.agentKey === activeTab) pendingHandoff.current = null;

      return (
        <AgentPage
          key={activeTab}
          config={agentConfigs[activeTab]}
          user={user}
          initialMessages={initialMessages}
        />
      );
    }
    return <LandingPage setActiveTab={setActiveTab} />;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0a0a0a] sm:bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      <Header
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        user={user}
        onLoginClick={() => setShowLogin(true)}
        onLogoutClick={signOut}
        onHomeClick={goHome}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isOpen={isSidebarOpen}
          closeSidebar={closeSidebar}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onHomeClick={goHome}
        />
        {renderContent()}
      </div>

      {/* Login Modal */}
      {showLogin && (
        <LoginModal
          pendingAgent={pendingHandoff.current?.agentKey ?? null}
          onClose={handleCloseLogin}
        />
      )}
    </div>
  );
}

export default App;
