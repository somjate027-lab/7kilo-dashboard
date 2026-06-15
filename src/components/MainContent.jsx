import React, { useState, useRef, useEffect } from 'react';
import { LOGO_DATA_URL } from '../constants/logo';
import { MASCOT_DATA_URL } from '../constants/mascot';
import { CAR_TOYOTA_YARIS, CAR_HONDA_CITY, CAR_ISUZU_DMAX, CAR_MAZDA_2 } from '../constants/cars';
import { centerSystemPrompt, agentPrompts, parseRoute, agentLabels } from '../agents/centerAgent';
import { summarizeChat, saveToLocal } from '../agents/summaryAgent';
import { saveCaseToSupabase } from '../utils/supabase';
import { analyzeCloneRisk } from '../utils/cloneScanAnalyzer';
import { analyzeBotRisk } from '../utils/botHunterAnalyzer';
import { analyzeDocForge } from '../utils/docForgeAnalyzer';
import { analyzeScraperLeads } from '../utils/scraperAnalyzer';
import CloneDetectorCard from './CloneDetectorCard';
import BotHunterCard from './BotHunterCard';
import DocForgeCard from './DocForgeCard';
import ScraperCard from './ScraperCard';
import {
  Plus,
  AtSign,
  Settings2,
  Zap,
  Infinity,
  RotateCw,
  RefreshCw,
  Globe,
  Folder,
  Sparkles,
  ChevronDown,
  Send,
  Sliders,
  Bookmark,
  Share2,
  Eye,
  Heart,
  X,
  FileText,
  Trash2,
  User,
  StopCircle,
  AlertCircle,
  ImagePlus,
  ScanSearch,
  Bot,
  FileWarning,
  Globe2,
  Check,
  Link,
  Mic,
  PlusCircle,
} from 'lucide-react';

// Import local assets

// Simple parser for markdown-style bold formatting (**text**) inside messages
const parseInlineMarkdown = (text) => {
  const parts = [];
  let remaining = text;
  const boldRegex = /\*\*([^*]+)\*\*/;
  
  while (remaining) {
    const match = boldRegex.exec(remaining);
    if (match) {
      const matchIndex = match.index;
      if (matchIndex > 0) {
        parts.push(remaining.substring(0, matchIndex));
      }
      parts.push(
        <strong key={remaining.length + matchIndex} className="font-bold text-inherit">
          {match[1]}
        </strong>
      );
      remaining = remaining.substring(matchIndex + match[0].length);
    } else {
      parts.push(remaining);
      break;
    }
  }
  
  return parts;
};

// Formats API reply text to support paragraphs, lists, and headers
const renderMessageContent = (content) => {
  if (!content) return null;
  
  const paragraphs = content.split('\n\n');
  
  return paragraphs.map((para, paraIdx) => {
    const lines = para.split('\n');
    
    // Check for bullet lists
    const isBulletList = lines.length > 0 && lines.every(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('- ') || trimmed.startsWith('* ');
    });
    
    // Check for numbered lists
    const isNumberedList = lines.length > 0 && lines.every(line => {
      const trimmed = line.trim();
      return /^\d+\.\s/.test(trimmed);
    });
    
    if (isBulletList) {
      return (
        <ul key={paraIdx} className="list-disc pl-5 mb-3 space-y-1 text-inherit">
          {lines.map((line, lineIdx) => {
            const itemText = line.trim().replace(/^[-*]\s+/, '');
            return <li key={lineIdx}>{parseInlineMarkdown(itemText)}</li>;
          })}
        </ul>
      );
    }
    
    if (isNumberedList) {
      return (
        <ol key={paraIdx} className="list-decimal pl-5 mb-3 space-y-1 text-inherit">
          {lines.map((line, lineIdx) => {
            const itemText = line.trim().replace(/^\d+\.\s+/, '');
            return <li key={lineIdx}>{parseInlineMarkdown(itemText)}</li>;
          })}
        </ol>
      );
    }
    
    const trimmedPara = para.trim();
    if (trimmedPara.startsWith('### ')) {
      return (
        <h4 key={paraIdx} className="text-sm font-bold text-inherit mt-4 mb-2">
          {parseInlineMarkdown(trimmedPara.substring(4))}
        </h4>
      );
    }
    if (trimmedPara.startsWith('## ')) {
      return (
        <h3 key={paraIdx} className="text-base font-bold text-inherit mt-5 mb-2">
          {parseInlineMarkdown(trimmedPara.substring(3))}
        </h3>
      );
    }
    if (trimmedPara.startsWith('# ')) {
      return (
        <h2 key={paraIdx} className="text-lg font-bold text-inherit mt-6 mb-3">
          {parseInlineMarkdown(trimmedPara.substring(2))}
        </h2>
      );
    }
    
    return (
      <p key={paraIdx} className="mb-2.5 last:mb-0 text-inherit">
        {lines.map((line, lineIdx) => (
          <React.Fragment key={lineIdx}>
            {lineIdx > 0 && <br />}
            {parseInlineMarkdown(line)}
          </React.Fragment>
        ))}
      </p>
    );
  });
};

/* ─────────────────────────────────────────────
   LiveCounter — animated number that counts up
   from 0 → target value when mounted
───────────────────────────────────────────── */
const LiveCounter = ({ value, suffix = '', duration = 1500, className = '' }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTime;
    let frameId;
    const animate = (now) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(value * eased));
      if (progress < 1) frameId = requestAnimationFrame(animate);
      else setCurrent(value);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return <span className={className}>{current}{suffix}</span>;
};

const AGENT_OPTIONS = [
  { key: 'AUTO',           label: 'อัตโนมัติ',       icon: Sparkles,   color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { key: 'CLONE_DETECTOR', label: 'Clone Detector', icon: ScanSearch, color: 'text-violet-600', bg: 'bg-violet-50' },
  { key: 'BOT_HUNTER',     label: 'Bot Hunter',     icon: Bot,        color: 'text-rose-600',   bg: 'bg-rose-50' },
  { key: 'DOC_FORGE',      label: 'Doc Forge',      icon: FileWarning,color: 'text-amber-600',  bg: 'bg-amber-50' },
  { key: 'SCRAPER',        label: 'Scraper',        icon: Globe2,     color: 'text-teal-600',   bg: 'bg-teal-50' },
];

export default function MainContent({ user, requestLogin }) {
  const [showTag, setShowTag] = useState(true);
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  // Toolbar state
  const [attachedImage, setAttachedImage] = useState(null); // { file, url }
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const [forcedAgent, setForcedAgent] = useState('AUTO'); // 'AUTO' | agent key
  const fileInputRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState(null);
  const [dispatchedRoute, setDispatchedRoute] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [lastSummary, setLastSummary] = useState(null);

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);


  // Automatically scroll to the bottom of the chat list on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up any ongoing API requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    // Reset input field
    setInputText('');

    // Append user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Append a placeholder assistant message that will stream in
    const assistantMessageId = (Date.now() + 1).toString();
    const newAssistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newAssistantMessage]);

    // Set up request abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error("Groq API key not found. Please check that VITE_GROQ_API_KEY is defined in your .env file.");
      }

      // ลำดับความสำคัญ: forcedAgent (user เลือกเอง) > activeAgent (dispatched) > center
      const effectiveAgent = forcedAgent !== 'AUTO' ? forcedAgent : activeAgent;
      if (forcedAgent !== 'AUTO' && !activeAgent) {
        setActiveAgent(forcedAgent);
        setDispatchedRoute(forcedAgent);
      }
      const currentSystemPrompt = effectiveAgent && agentPrompts[effectiveAgent]
        ? agentPrompts[effectiveAgent]
        : centerSystemPrompt;

      const apiMessages = [
        { role: 'system', content: currentSystemPrompt },
        ...updatedMessages
          .filter(msg => msg.role === 'user' || msg.role === 'assistant')
          .map(msg => ({
            role: msg.role,
            content: msg.content.replace(/\nROUTE:.*$/m, '')
          }))
      ];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: selectedModel,
          messages: apiMessages,
          stream: true,
          max_tokens: 450,
          temperature: 0.6
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last partial line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed === 'data: [DONE]') continue;
          
          if (trimmed.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const contentDelta = parsed.choices[0]?.delta?.content || '';
              if (contentDelta) {
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: msg.content + contentDelta } 
                    : msg
                ));
              }
            } catch (err) {
              console.warn("Failed to parse SSE line", trimmed, err);
            }
          }
        }
      }

      // Check if there is any trailing content in the buffer
      if (buffer) {
        const trimmed = buffer.trim();
        if (trimmed && trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const contentDelta = parsed.choices[0]?.delta?.content || '';
            if (contentDelta) {
              setMessages(prev => prev.map(msg =>
                msg.id === assistantMessageId
                  ? { ...msg, content: msg.content + contentDelta }
                  : msg
              ));
            }
          } catch (err) {
            // Ignore trailing partial parse errors
          }
        }
      }

      // ตรวจ ROUTE จาก center agent แล้ว dispatch ไป sub-agent
      if (!activeAgent) {
        setMessages(prev => {
          const lastMsg = prev.find(m => m.id === assistantMessageId);
          if (lastMsg) {
            const route = parseRoute(lastMsg.content);
            if (route) {
              if (!user && route === 'CLONE_DETECTOR') {
                // แสดง scan card เบื้องต้นก่อน login
                const conversationMsgs = prev.filter(m => m.role === 'user' || m.role === 'assistant');
                const scanCardMsg = {
                  id: (Date.now() + 2).toString(),
                  role: 'scan-result',
                  scanType: 'CLONE_DETECTOR',
                  scanData: null,   // จะ update เมื่อ analyzeCloneRisk เสร็จ
                  timestamp: new Date(),
                };
                // kick off analyzer async — update scanData เมื่อเสร็จ
                analyzeCloneRisk(conversationMsgs)
                  .then(data => {
                    setMessages(all =>
                      all.map(m => m.id === scanCardMsg.id ? { ...m, scanData: data } : m)
                    );
                  })
                  .catch(() => {}); // fail silently — card แสดง default state
                return [...prev, scanCardMsg];
              }

              if (!user && route === 'BOT_HUNTER') {
                const conversationMsgs = prev.filter(m => m.role === 'user' || m.role === 'assistant');
                const scanCardMsg = {
                  id: (Date.now() + 2).toString(),
                  role: 'scan-result',
                  scanType: 'BOT_HUNTER',
                  scanData: null,
                  timestamp: new Date(),
                };
                analyzeBotRisk(conversationMsgs)
                  .then(data => {
                    setMessages(all =>
                      all.map(m => m.id === scanCardMsg.id ? { ...m, scanData: data } : m)
                    );
                  })
                  .catch(() => {});
                return [...prev, scanCardMsg];
              }

              if (!user && route === 'DOC_FORGE') {
                const conversationMsgs = prev.filter(m => m.role === 'user' || m.role === 'assistant');
                const scanCardMsg = {
                  id: (Date.now() + 2).toString(),
                  role: 'scan-result',
                  scanType: 'DOC_FORGE',
                  scanData: null,
                  timestamp: new Date(),
                };
                analyzeDocForge(conversationMsgs)
                  .then(data => {
                    setMessages(all =>
                      all.map(m => m.id === scanCardMsg.id ? { ...m, scanData: data } : m)
                    );
                  })
                  .catch(() => {});
                return [...prev, scanCardMsg];
              }

              if (!user && route === 'SCRAPER') {
                const conversationMsgs = prev.filter(m => m.role === 'user' || m.role === 'assistant');
                const scanCardMsg = {
                  id: (Date.now() + 2).toString(),
                  role: 'scan-result',
                  scanType: 'SCRAPER',
                  scanData: null,
                  timestamp: new Date(),
                };
                analyzeScraperLeads(conversationMsgs)
                  .then(data => {
                    setMessages(all =>
                      all.map(m => m.id === scanCardMsg.id ? { ...m, scanData: data } : m)
                    );
                  })
                  .catch(() => {});
                return [...prev, scanCardMsg];
              }

              if (!user) {
                // fallback: notice ปกติ + login modal
                requestLogin?.(route, prev.filter(m => m.role === 'user' || m.role === 'assistant'));
                const loginNotice = {
                  id: (Date.now() + 2).toString(),
                  role: 'system-notice',
                  content: `🔐 กรุณาเข้าสู่ระบบเพื่อใช้งาน ${agentLabels[route]} และบันทึกข้อมูลคดี`,
                  timestamp: new Date()
                };
                return [...prev, loginNotice];
              }
              setDispatchedRoute(route);
              setActiveAgent(route);
              const dispatchNotice = {
                id: (Date.now() + 2).toString(),
                role: 'system-notice',
                content: `🔀 Dispatching to ${agentLabels[route]}...`,
                timestamp: new Date()
              };
              return [...prev, dispatchNotice];
            }
          }
          return prev;
        });
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: msg.content + '\n\n*(Generation stopped by user)*' } 
            : msg
        ));
      } else {
        console.error("Groq API request failed", error);
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: msg.content + `\n\n*Error: ${error.message || "Failed to fetch response from Groq API."}*` } 
            : msg
        ));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const trendingProjects = [
    {
      id: 1,
      title: 'Toyota Yaris ATIV 2023',
      thumbnail: CAR_TOYOTA_YARIS,
      status: 'high-risk',
      statusLabel: 'เสี่ยงสูง',
      statusIcon: '●',
      description: 'พบรูปซ้ำใน 4 โพสต์จาก 2 แพลตฟอร์ม',
      footerLeft: '4 โพสต์',
      footerRight: '12 รูปซ้ำ',
      platforms: ['Kaidee', 'Chobrod']
    },
    {
      id: 2,
      title: 'Honda City สีขาว',
      thumbnail: CAR_HONDA_CITY,
      status: 'duplicate',
      statusLabel: 'พบรูปซ้ำ',
      statusIcon: '⊙',
      description: 'รูปเดียวกันถูกใช้โดยผู้ขายหลายบัญชี',
      footerLeft: '3 บัญชี',
      footerRight: '8 รูปซ้ำ',
      platforms: ['Seller_88', 'AutoGood', 'CarMarket']
    },
    {
      id: 3,
      title: 'Isuzu D-Max Hi-Lander',
      thumbnail: CAR_ISUZU_DMAX,
      status: 'investigating',
      statusLabel: 'กำลังตรวจสอบ',
      statusIcon: '⟳',
      description: 'พบโพสต์ราคาผิดปกติและรายละเอียดไม่ตรง',
      footerLeft: '2 โพสต์',
      footerRight: 'Risk 78%',
      priceFound: ['฿ 659,000', '฿ 399,000', '฿ 315,000'],
      priceMarket: '฿ 579,000',
      priceDiff: '-29%'
    },
    {
      id: 4,
      title: 'Mazda 2 Hatchback',
      thumbnail: CAR_MAZDA_2,
      status: 'completed',
      statusLabel: 'ตรวจเสร็จแล้ว',
      statusIcon: '✓',
      description: 'สรุปหลักฐานพร้อมลิงก์และเวลาโพสต์แล้ว',
      footerLeft: 'รายงานพร้อม',
      footerRight: 'อัปเดตล่าสุด',
      evidence: ['รูปซ้ำ 6 รายการ', 'ข้อมูลไม่ตรง 2 จุด', 'ราคาผิดปกติ'],
      timeline: ['8 พ.ค.', '12 พ.ค.', '15 พ.ค.']
    }
  ];

  const statusStyles = {
    'high-risk':     { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200' },
    'duplicate':     { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    'investigating': { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200' },
    'completed':     { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-200' }
  };

  // If chat is active, display the premium interactive chat thread
  if (messages.length > 0) {
    return (
      <div className="flex-1 flex flex-col h-full w-full min-w-0 bg-[#0a0a0a] sm:bg-grid-pattern sm:bg-[#fcfdfe] relative overflow-hidden">
        
        {/* Chat Session Header */}
        <div className="flex items-center justify-between border-b-0 sm:border-b border-white/0 sm:border-slate-150/60 bg-[#0a0a0a]/90 sm:bg-white/80 backdrop-blur-md px-4 md:px-8 py-3 sm:py-4 sticky top-0 z-10 sm:shadow-3xs">
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex w-10 h-10 rounded-full overflow-hidden bg-white border border-slate-100 items-center justify-center shadow-sm">
              <img src={LOGO_DATA_URL} alt="7kilo" className="w-8 h-8 object-contain drop-shadow-[0_0_14px_rgba(96,165,250,0.9)]" />
            </div>
            <div>
              <div className="text-sm font-bold text-white sm:text-slate-800 flex items-center gap-2">
                7กิโล๊ะ
                <span className="hidden sm:inline"> — นักสืบรถหาย</span>
                <span className="hidden sm:inline px-1.5 py-0.5 text-[9px] bg-rose-50 text-rose-500 rounded-md font-bold border border-rose-100/50">
                  {selectedModel}
                </span>
                {activeAgent && (
                  <span className="px-2 py-0.5 text-[9px] bg-indigo-500/20 text-indigo-300 sm:bg-indigo-50 sm:text-indigo-600 rounded-md font-bold border border-indigo-400/30 sm:border-indigo-100/50 animate-pulse">
                    {agentLabels[activeAgent]}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
                Car Investigation AI · รถหายเริ่มจากตรงนี้
              </div>
            </div>
          </div>
          
          <button 
            onClick={async () => {
              if (abortControllerRef.current) abortControllerRef.current.abort();
              // สรุปก่อน reset ถ้ามีข้อความพอ
              if (messages.filter(m => m.role === 'user').length >= 2) {
                setIsSummarizing(true);
                const apiKey = import.meta.env.VITE_GROQ_API_KEY;
                const result = await summarizeChat(messages, apiKey);
                if (result.success) {
                  // บันทึก localStorage
                  const count = saveToLocal(result.data);
                  setLastSummary(result.data);
                  // ส่งไป Supabase
                  await saveCaseToSupabase(result.data);
                }
                setIsSummarizing(false);
              }
              setMessages([]);
              setActiveAgent(null);
              setDispatchedRoute(null);
            }}
            className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 hover:bg-rose-500/10 sm:hover:bg-rose-50 border border-white/[0.08] sm:border-slate-205 hover:border-rose-400/30 sm:hover:border-rose-200 rounded-xl text-xs font-bold text-slate-400 sm:text-slate-500 hover:text-rose-400 sm:hover:text-rose-600 transition-all cursor-pointer sm:shadow-3xs disabled:opacity-50"
            disabled={isSummarizing}
          >
            <Trash2 className="w-3.5 sm:w-3.8 h-3.5 sm:h-3.8" />
            <span className="hidden sm:inline">{isSummarizing ? 'กำลังสรุปคดี...' : 'Reset Conversation'}</span>
          </button>
        </div>

        {/* Scrollable Message List */}
        <div className="flex-1 overflow-y-auto scrollbar-none px-4 md:px-8 py-6 space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* System Context Banner */}
            <div className="p-3 sm:p-4 bg-white/[0.04] sm:bg-indigo-50/50 border-0 sm:border sm:border-indigo-100 rounded-2xl flex items-start space-x-3 text-xs text-slate-400 sm:text-slate-600 sm:shadow-3xs">
              <Sparkles className="w-4.5 h-4.5 text-indigo-400 sm:text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-indigo-300 sm:text-indigo-700">🔍 Investigation Mode:</span> ผมคือ <strong className="text-white sm:text-slate-800 font-semibold">7กิโล๊ะ</strong> — คุ้ยถังขยะดิจิทัลหารถหาย ทำได้ทั้ง <strong className="text-white sm:text-slate-800 font-semibold">ตรวจ Clone รูปรถ, หา Bot ขายรถ, ขุดเอกสาร AI Generate</strong> และ <strong className="text-white sm:text-slate-800 font-semibold">Scrape Network</strong> เล่าให้ฟังว่ารถหายยังไง
              </div>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 md:space-x-4 ${
                  msg.role === 'user' ? 'justify-end' :
                  msg.role === 'system-notice' ? 'justify-center' :
                  msg.role === 'scan-result' ? 'justify-start' :
                  'justify-start'
                }`}
              >
                {/* Scan Result Card — Clone Detector */}
                {msg.role === 'scan-result' && msg.scanType === 'CLONE_DETECTOR' && (
                  <div className="w-full max-w-sm ml-0">
                    <CloneDetectorCard
                      scanData={msg.scanData}
                      onLoginSave={() => requestLogin?.(
                        'CLONE_DETECTOR',
                        messages.filter(m => m.role === 'user' || m.role === 'assistant')
                      )}
                    />
                  </div>
                )}

                {/* Scan Result Card — Bot Hunter */}
                {msg.role === 'scan-result' && msg.scanType === 'BOT_HUNTER' && (
                  <div className="w-full max-w-sm ml-0">
                    <BotHunterCard
                      scanData={msg.scanData}
                      onLoginSave={() => requestLogin?.(
                        'BOT_HUNTER',
                        messages.filter(m => m.role === 'user' || m.role === 'assistant')
                      )}
                    />
                  </div>
                )}

                {/* Scan Result Card — Doc Forge */}
                {msg.role === 'scan-result' && msg.scanType === 'DOC_FORGE' && (
                  <div className="w-full max-w-sm ml-0">
                    <DocForgeCard
                      scanData={msg.scanData}
                      onLoginSave={() => requestLogin?.(
                        'DOC_FORGE',
                        messages.filter(m => m.role === 'user' || m.role === 'assistant')
                      )}
                    />
                  </div>
                )}

                {/* Scan Result Card — Scraper */}
                {msg.role === 'scan-result' && msg.scanType === 'SCRAPER' && (
                  <div className="w-full max-w-sm ml-0">
                    <ScraperCard
                      scanData={msg.scanData}
                      onLoginSave={() => requestLogin?.(
                        'SCRAPER',
                        messages.filter(m => m.role === 'user' || m.role === 'assistant')
                      )}
                    />
                  </div>
                )}

                {/* System Notice — dispatch badge */}
                {msg.role === 'system-notice' && (
                  <div className="px-4 py-2 bg-indigo-500/10 sm:bg-indigo-50 border border-indigo-400/20 sm:border-indigo-100 rounded-full text-xs font-bold text-indigo-300 sm:text-indigo-600 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 fill-indigo-400" />
                    {msg.content}
                  </div>
                )}
                {(msg.role === 'system-notice' || msg.role === 'scan-result') && null /* skip normal bubble render */}
                {/* Assistant Avatar */}
                {msg.role !== 'system-notice' && msg.role !== 'scan-result' && msg.role === 'assistant' && (
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-transparent sm:bg-[#102033] sm:border sm:border-[#27415f] flex items-center justify-center shrink-0 mt-1 relative">
                    <div className="absolute inset-0 rounded-full bg-blue-500/25 blur-md sm:hidden" />
                    <img src={MASCOT_DATA_URL} alt="7กิโล๊ะ" className="relative w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(249,89,123,0.5)] sm:drop-shadow-[0_0_14px_rgba(96,165,250,0.9)]" />
                  </div>
                )}

                {/* Message Bubble — ไม่แสดงสำหรับ system-notice และ scan-result */}
                {msg.role !== 'system-notice' && msg.role !== 'scan-result' && <div
                  className={`text-sm relative leading-relaxed sm:shadow-3xs ${
                    msg.role === 'user'
                      ? 'bg-white/[0.10] sm:bg-slate-900 border-0 sm:border border-slate-900 text-white rounded-2xl sm:rounded-tr-none px-4 py-2.5 sm:px-4 sm:py-3 max-w-[80%]'
                      : 'bg-transparent sm:bg-white border-0 sm:border border-slate-150 text-[#e8e8e8] sm:text-slate-800 px-0 sm:px-4 sm:py-3 max-w-full sm:max-w-[85%] rounded-none sm:rounded-2xl sm:rounded-tl-none'
                  }`}
                >
                  <div className={`text-[10px] font-bold mb-1 tracking-wide ${msg.role === 'user' ? 'text-indigo-200 text-right' : 'text-[#8fb4ff] sm:text-indigo-600'}`}>
                    {msg.role === 'user' ? 'You' : '7กิโล๊ะ'}
                  </div>

                  <div className="whitespace-pre-wrap break-words">
                    {msg.content === '' && isLoading && msg === messages[messages.length - 1] ? (
                      <div className="flex items-center space-x-1.5 py-1.5 px-0.5">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    ) : (
                      renderMessageContent(msg.content)
                    )}
                  </div>
                </div>}

                {/* User Avatar — ไม่แสดงสำหรับ scan-result */}
                {msg.role !== 'scan-result' && msg.role === 'user' && (
                  <div className="w-8.5 h-8.5 rounded-full bg-indigo-500/20 sm:bg-indigo-50 border-0 sm:border sm:border-indigo-100 flex items-center justify-center shrink-0 sm:shadow-3xs mt-1">
                    <User className="w-4 h-4 text-indigo-400 sm:text-indigo-650" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Active Chat Input Area */}
        <div className="border-t border-white/[0.05] sm:border-slate-150/80 bg-[#0a0a0a] sm:bg-white px-4 md:px-8 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/[0.04] sm:bg-slate-50 border border-white/[0.08] sm:border-slate-205 rounded-2xl p-3 transition-all focus-within:border-indigo-400 focus-within:shadow-md">
              <div className="flex w-full pb-2">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="ถาม 7กิโล๊ะ หรือเพิ่มข้อมูลรถที่กำลังสืบ..."
                  className="flex-1 w-full border-0 focus:ring-0 text-white sm:text-slate-700 placeholder-[#8a8a8a] sm:placeholder-slate-400 text-sm py-2 px-1 focus:outline-hidden resize-none h-14 bg-transparent"
                  disabled={isLoading}
                />
              </div>

              {/* Bottom Toolbar row */}
              <div className="flex items-center justify-between border-t border-white/[0.05] sm:border-slate-100 pt-3">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-500 sm:text-slate-400 font-semibold">
                    Enter ส่ง · Shift+Enter ขึ้นบรรทัด
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  {isLoading ? (
                    <button 
                      onClick={() => abortControllerRef.current?.abort()}
                      className="p-2 text-rose-450 bg-rose-500/10 sm:bg-rose-50 hover:bg-rose-500/20 sm:hover:bg-rose-100 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 text-xs font-bold border border-rose-900/30 sm:border-rose-100 shadow-3xs"
                    >
                      <StopCircle className="w-4 h-4 text-rose-400 sm:text-rose-505 fill-rose-900/20 sm:fill-rose-100" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleSendMessage()}
                      disabled={!inputText.trim()}
                      className={`p-2.5 text-white rounded-xl transition-all duration-300 transform active:scale-95 cursor-pointer ${
                        inputText.trim() 
                          ? 'bg-[#f9597b] sm:bg-slate-900 hover:bg-[#e0486a] sm:hover:bg-slate-800 shadow-md hover:shadow-lg' 
                          : 'bg-white/[0.06] sm:bg-slate-200 cursor-not-allowed text-slate-500 sm:text-slate-400'
                      }`}
                    >
                      <Send className="w-4 h-4 fill-current" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // Dashboard initial / empty state
  return (
    <div className="flex-1 overflow-y-auto relative bg-[#0a0a0a] sm:bg-grid-pattern sm:bg-[#fcfdfe]">

      {/* ═══════════ MOBILE — Premium Kimi-style dark home ═══════════ */}
      <div className="sm:hidden flex flex-col px-6 pt-6 pb-[180px] bg-[#0a0a0a]">

        {/* Avatar + greeting header */}
        <div className="mb-2">

          {/* 7kilo Blue Mascot avatar with glow + bounce + speech bubble */}
          <div className="relative w-[72px] h-[72px] mb-3 animate-bounce">
            {/* Pulsing blue glow */}
            <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-2xl scale-150 animate-pulse" />
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src="/mascot-blue.png" 
                alt="7กิโล๊ะ Mascot" 
                className="w-[110%] h-[110%] object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]" 
                onError={(e) => {
                  e.target.src = MASCOT_DATA_URL;
                }}
              />
            </div>
            {/* Speech bubble "ว่าไง" — pink gradient */}
            <div className="absolute -top-2 left-[82px] bg-gradient-to-br from-[#f9597b] to-[#c9468f] text-white text-[13px] font-semibold px-3.5 py-1.5 rounded-2xl rounded-bl-none whitespace-nowrap shadow-[0_4px_14px_rgba(249,89,123,0.45)]">
              ว่าไง 👋
              <div className="absolute bottom-0 left-0 w-0 h-0 border-t-[8px] border-t-[#c9468f] border-r-[8px] border-r-transparent translate-y-full" />
            </div>
          </div>

          {/* Main greeting */}
          <h1 className="text-[17px] font-normal text-white tracking-wide mb-2">
            เริ่มสืบจากถังขยะ... อะไรก่อนดี
          </h1>
        </div>

        {/* CTA highlight card — Kimi Token Cup */}
        <button
          onClick={() => handleSendMessage('รถผมหาย สงสัยโจรใช้ AI โคลนรูปแปลงสี/มุม/ทะเบียน แล้วเอาไปโพสต์ขายในเว็บมือสอง — ช่วยสแกนหาประกาศที่ตรงกับรถผม และบอกจุดพิรุธที่จับได้')}
          className="w-fit flex items-center gap-2 bg-[#2b1820] hover:bg-[#3a1d28] border border-[#522b3a] rounded-xl px-4 py-2 mb-2 active:scale-[0.98] transition-all cursor-pointer text-left"
        >
          <div className="w-4 h-4 rounded-full bg-[#f9597b] text-[#2b1820] flex items-center justify-center shrink-0">
            <span className="text-[10px] leading-none mb-[1px]">★</span>
          </div>
          <span className="text-[#f9597b] text-[13.5px] font-medium tracking-wide">รถหาย + AI โคลน นำไปโพสต์ขาย</span>
        </button>

        {/* Suggestion cards — dark premium cards */}
        <div className="space-y-2 mb-4">
          {[
            { text: '📍 ตามรถผ่าน GPS เก่า + cache map', prompt: 'อธิบายให้ฟังหน่อย โจรยุคนี้ใช้ AI หลอกขายรถยังไงบ้าง ทั้งคลิปรถปลอม Chatbot คัดเหยื่อ และ Voice Cloning ปิด GPS — พร้อมวิธีสังเกตและป้องกัน' },
            { text: 'วิธีตรวจจับโพสต์บอทขายรถต้องสงสัย', prompt: 'ช่วยสอนวิธีตรวจจับโพสต์ขายรถที่เป็นบอท/มิจฉาชีพ — สัญญาณอันตรายมีอะไรบ้าง' },
            { text: 'วิเคราะห์เอกสารรถยนต์ปลอมแปลงด้วย AI', prompt: 'ช่วยอธิบายวิธีวิเคราะห์เอกสารรถ (เล่มทะเบียน ใบเสร็จ) ที่ปลอมแปลงด้วย AI — เช็คอะไรบ้าง' },
          ].map((s, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(s.prompt)}
              className="w-fit text-left bg-transparent hover:bg-white/[0.02] border border-[#2b2b2b] rounded-xl px-4 py-2 active:scale-[0.98] transition-all cursor-pointer flex items-center"
            >
              <span className="text-[#e0e0e0] text-[13.5px] font-medium tracking-wide">{s.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE — fixed bottom: agent pills + input bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0a0a0a] pt-3 pb-6 px-4">

        {/* Agent pills — horizontal scroll */}
        <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-none">
          {[
            { label: 'ตรวจรูปโคลน', icon: Bot },
            { label: 'ล่าบอทขายรถ', icon: FileText },
            { label: 'แกะเอกสารปลอม', icon: Link },
            { label: 'ขุดข้อมูลเว็บ', icon: Share2 }
          ].map((opt, i) => {
            const Icon = opt.icon;
            return (
              <button
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#2b2b2b] text-[13.5px] text-[#e0e0e0] whitespace-nowrap transition-all cursor-pointer active:bg-white/[0.05]"
              >
                <Icon className="w-4 h-4 text-[#8a8a8a]" />
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Input bar — Kimi-style: rounded-full pill bar */}
        <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-full pl-4 pr-3 py-2.5">
          <Mic className="w-6 h-6 text-[#8a8a8a] flex-shrink-0 cursor-pointer" strokeWidth={1.5} />
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSendMessage(); } }}
            placeholder="พิมพ์เพื่อเริ่มคุ้ยหาเบาะแสรถหาย..."
            className="flex-1 w-full bg-transparent text-[15px] text-white placeholder-[#666666] focus:outline-none py-0.5 tracking-wide"
          />
          <button className="flex-shrink-0 cursor-pointer text-[#8a8a8a] hover:text-[#e0e0e0]">
            <PlusCircle className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ═══════════ DESKTOP — existing layout ═══════════ */}
      <div className="hidden sm:block px-4 md:px-8 py-6 md:py-10">

      {/* 7กิโล๊ะ Introduction Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between max-w-4xl mx-auto mb-6 md:mb-8 bg-transparent gap-3 md:gap-0">
        
        {/* Left Side: Avatar & Intro Text */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden bg-white border border-slate-100 flex items-center justify-center shadow-sm">
            <img src={LOGO_DATA_URL} alt="7kilo" className="w-9 h-9 md:w-10 md:h-10 object-contain" />
          </div>
          <div>
            <div className="text-[10px] md:text-xs font-bold text-indigo-500 uppercase tracking-wider">AI นักสืบรถหาย</div>
            <h1 className="text-base md:text-2xl font-bold tracking-tight text-slate-800 mt-0.5">
              รถหายเริ่มจากตรงนี้ — <span className="text-[#f9597b]">7กิโล๊ะ</span>
            </h1>
          </div>
        </div>

        {/* Right Side: Credit CTA Button */}
        <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="text-emerald-700 font-semibold">7กิโล๊ะ AI พร้อมช่วยสืบคดี</span>
        </div>

      </div>

      {/* Central Input Container Area */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-200/90 rounded-2xl shadow-sm shadow-slate-100/40 p-3 md:p-4 mb-8 md:mb-14 transition-all duration-300 focus-within:border-indigo-400/80 focus-within:shadow-md focus-within:shadow-indigo-50/30">

        {/* Image preview strip */}
        {attachedImage && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
            <div class="bg-slate-200 rounded w-12 h-12 flex items-center justify-center text-xs">image</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{attachedImage.file.name}</p>
              <p className="text-[11px] text-slate-400">{(attachedImage.file.size / 1024).toFixed(0)} KB · รูปรถแนบแล้ว</p>
            </div>
            <button onClick={() => setAttachedImage(null)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer flex-shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Prominent Removable Tag 'Briefing' + Input block */}
        <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-2 min-h-12 w-full pb-2">
          {showTag && (
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-rose-50 text-[11px] font-bold text-rose-500 rounded-lg border border-rose-100/50 mt-1 select-none animate-fade-in">
              <FileText className="w-3.5 h-3.5" />
              <span>สืบรถหาย</span>
              <button 
                onClick={() => setShowTag(false)} 
                className="hover:bg-rose-100 p-0.5 rounded transition-colors text-rose-450 hover:text-rose-650 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="แจ้งรายละเอียดรถที่หาย เช่น ยี่ห้อ รุ่น ทะเบียน สีรถ ช่วงเวลาที่หาย — 7กิโล๊ะจะเริ่มสืบให้ทันที..."
            className="flex-1 w-full border-0 focus:ring-0 text-slate-700 placeholder-slate-400 text-sm py-2 px-1 focus:outline-hidden resize-none h-14"
          />
        </div>

        {/* Bottom Toolbar row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-50 pt-3 gap-3">

          {/* Toolbar Left Group */}
          <div className="flex flex-wrap items-center gap-2">

            {/* Quick add icons — ซ่อนบน mobile เหลือแค่ปุ่มสำคัญ */}
            <button className="hidden sm:block p-1.5 hover:bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
              <Plus className="w-4 h-4" />
            </button>
            <button className="hidden sm:block p-1.5 hover:bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
              <AtSign className="w-4 h-4" />
            </button>

            <span className="hidden sm:block h-4 w-px bg-slate-200 mx-1"></span>

            {/* แนบรูปรถ */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setAttachedImage({ file, url: URL.createObjectURL(file) });
                e.target.value = '';
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 border rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                attachedImage
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-150 text-slate-600 hover:text-slate-800'
              }`}
            >
              <ImagePlus className={`w-3.5 h-3.5 ${attachedImage ? 'text-indigo-500' : 'text-slate-400'}`} />
              <span>{attachedImage ? attachedImage.file.name.slice(0, 12) + '…' : 'แนบรูปรถ'}</span>
              {attachedImage && (
                <span
                  onClick={(e) => { e.stopPropagation(); setAttachedImage(null); }}
                  className="ml-0.5 text-indigo-400 hover:text-rose-500 cursor-pointer"
                >×</span>
              )}
            </button>

            {/* เลือก Agent */}
            <div className="relative">
              <button
                onClick={() => setShowAgentPicker(p => !p)}
                className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 border rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  forcedAgent !== 'AUTO'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-150 text-slate-600 hover:text-slate-800'
                }`}
              >
                {(() => {
                  const a = AGENT_OPTIONS.find(o => o.key === forcedAgent);
                  const Icon = a?.icon || Sparkles;
                  return <Icon className={`w-3.5 h-3.5 ${forcedAgent !== 'AUTO' ? 'text-indigo-500' : 'text-amber-500'}`} />;
                })()}
                <span>{forcedAgent === 'AUTO' ? 'เลือก Agent' : AGENT_OPTIONS.find(o => o.key === forcedAgent)?.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showAgentPicker && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
                  {AGENT_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => { setForcedAgent(opt.key); setShowAgentPicker(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors cursor-pointer ${
                          forcedAgent === opt.key ? 'bg-slate-50 font-semibold' : ''
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${opt.bg}`}>
                          <Icon className={`w-3.5 h-3.5 ${opt.color}`} />
                        </span>
                        <span className="text-slate-700">{opt.label}</span>
                        {forcedAgent === opt.key && <Check className="w-3.5 h-3.5 text-indigo-500 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Unlimited Usage Badge */}
            <button className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 transition-all cursor-pointer">
              <Infinity className="w-3.5 h-3.5 text-slate-400" />
              <span>Unlimited</span>
            </button>

            <span className="h-4 w-px bg-slate-200 mx-1"></span>

            {/* Secondary Toolbar Utilities — ซ่อนบน mobile */}
            <div className="hidden sm:flex items-center space-x-1">
              <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" title="Auto Model Sync">
                <RotateCw className="w-3.8 h-3.8" />
              </button>
              <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" title="Refresh">
                <RefreshCw className="w-3.8 h-3.8" />
              </button>
              <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" title="Globe Web Search">
                <Globe className="w-3.8 h-3.8" />
              </button>
              <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" title="Folder path">
                <Folder className="w-3.8 h-3.8" />
              </button>
            </div>

          </div>

          {/* Toolbar Right Group */}
          <div className="flex items-center space-x-2.5 relative">

            {/* Folder badge — ซ่อนบน mobile */}
            <button className="hidden sm:block p-1.5 hover:bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
              <Folder className="w-4 h-4" />
            </button>

            <span className="hidden sm:block h-4 w-px bg-slate-200"></span>

            {/* Interactive Model Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-slate-250 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-indigo-100" />
                <span>{selectedModel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showModelDropdown && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-slate-150 rounded-xl shadow-lg z-25 overflow-hidden">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedModel('llama-3.3-70b-versatile');
                        setShowModelDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition-colors ${
                        selectedModel === 'llama-3.3-70b-versatile' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                      }`}
                    >
                      llama-3.3-70b-versatile (Default)
                    </button>
                    <button
                      onClick={() => {
                        setSelectedModel('llama-3.1-70b-versatile');
                        setShowModelDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition-colors ${
                        selectedModel === 'llama-3.1-70b-versatile' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                      }`}
                    >
                      llama-3.1-70b-versatile
                    </button>
                    <button
                      onClick={() => {
                        setSelectedModel('mixtral-8x7b-32768');
                        setShowModelDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition-colors ${
                        selectedModel === 'mixtral-8x7b-32768' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                      }`}
                    >
                      mixtral-8x7b-32768
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button (Send) */}
            <button 
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className={`p-2.5 text-white rounded-xl transition-all duration-300 transform active:scale-95 cursor-pointer ${
                inputText.trim() 
                  ? 'bg-slate-900 hover:bg-slate-800 shadow-md hover:shadow-lg' 
                  : 'bg-slate-200 cursor-not-allowed text-slate-400'
              }`}
            >
              <Send className="w-4 h-4 fill-current" />
            </button>

          </div>

        </div>

      </div>

      {/* เคสที่กำลังคุ้ย Section */}
      <div className="max-w-6xl mx-auto">

        {/* Section Heading */}
        <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-5">
          เคสที่กำลังคุ้ย
        </h2>

        {/* Responsive Grid Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProjects.map((project) => {
            const style = statusStyles[project.status];
            return (
              <div
                key={project.id}
                className={`group bg-white rounded-2xl border border-slate-150/60 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col ${
                  project.status === 'completed' ? 'animate-success-glow' : ''
                }`}
              >
                {/* Status Badge Header */}
                <div className="p-3 pb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${style.bg} ${style.text} ${style.border} border text-[11px] font-semibold rounded-full ${
                    project.status === 'high-risk' ? 'animate-urgent-pulse' : ''
                  }`}>
                    <span className={`text-[10px] ${
                      project.status === 'high-risk' ? 'animate-status-blink' : ''
                    } ${
                      project.status === 'investigating' ? 'inline-block animate-slow-spin' : ''
                    }`}>{project.statusIcon}</span>
                    {project.statusLabel}
                  </span>
                </div>

                {/* Car Image with REDACTED plate */}
                <div className="relative mx-3 mb-3 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-28 sm:h-32 object-cover"
                  />

                  {/* Side info overlay */}
                  {project.platforms && project.status === 'high-risk' && (
                    <div className="absolute top-2 right-2 space-y-1">
                      {project.platforms.slice(0, 2).map((p, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-slate-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                          <span className="text-[10px] font-semibold text-slate-700">{p}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {project.platforms && project.status === 'duplicate' && (
                    <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px] p-1.5 sm:p-2 flex flex-col justify-center gap-0.5 sm:gap-1">
                      {project.platforms.map((p, i) => (
                        <div key={i} className="flex items-center gap-1.5 sm:gap-2 bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md shadow-sm border border-slate-100">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-200 flex items-center justify-center">
                            <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500" />
                          </div>
                          <span className="text-[9px] sm:text-[10px] font-semibold text-slate-700">{p}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {project.priceFound && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] p-1.5 sm:p-2 flex flex-col justify-center gap-0">
                      <p className="text-[8px] sm:text-[9px] text-slate-500 font-medium">ราคาที่พบ</p>
                      {project.priceFound.map((p, i) => (
                        <p key={i} className="text-[9px] sm:text-[10px] font-bold text-red-600 leading-tight">{p}</p>
                      ))}
                      <p className="text-[8px] sm:text-[9px] text-slate-500 font-medium mt-0.5 sm:mt-1">ราคาตลาด</p>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-700 leading-tight">{project.priceMarket}</p>
                      <p className="text-[8px] sm:text-[9px] text-red-600 font-bold mt-0.5">⚠ {project.priceDiff} ต่ำกว่าตลาด</p>
                    </div>
                  )}

                  {project.evidence && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] p-1.5 sm:p-2 flex flex-col justify-center gap-0">
                      <p className="text-[8px] sm:text-[9px] text-slate-500 font-medium mb-0.5">สรุปหลักฐาน</p>
                      {project.evidence.map((e, i) => (
                        <p key={i} className="text-[9px] sm:text-[10px] font-semibold text-green-700 flex items-center gap-1 leading-tight">
                          <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 shrink-0" /> {e}
                        </p>
                      ))}
                      {project.timeline && (
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200">
                          {project.timeline.map((t, i) => (
                            <span key={i} className="text-[8px] sm:text-[9px] text-slate-500 font-medium">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Title + Description */}
                <div className="px-4 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 leading-tight mb-1">
                    {project.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                    {project.description}
                  </p>
                </div>

                {/* Shimmer loading bar for investigating cards */}
                {project.status === 'investigating' && (
                  <div className="h-0.5 mx-4 mb-2 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full animate-shimmer-bar" />
                  </div>
                )}

                {/* Footer Stats */}
                <div className="mt-auto px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {project.footerLeft}
                  </span>
                  <span className={`flex items-center gap-1 ${
                    project.status === 'investigating' ? 'text-red-600 font-bold' : ''
                  }`}>
                    {project.status === 'investigating' && <AlertCircle className="w-3 h-3 text-red-500 animate-status-blink" />}
                    {project.status === 'completed' && <Check className="w-3 h-3 text-green-500" />}
                    {project.status === 'investigating' ? (
                      <>Risk <LiveCounter value={78} suffix="%" className="animate-number-tick inline-block" /></>
                    ) : (
                      project.footerRight
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      </div>{/* end DESKTOP wrapper */}

    </div>
  );
}
