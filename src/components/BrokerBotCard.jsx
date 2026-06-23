import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Zap, Copy, Banknote, FileX, Users,
  Save, ChevronRight, Lock, Search,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Broker Bot Detector — Interactive
   มุมนักสืบ: ลูกค้าแกล้งเป็นผู้ซื้อ ทักไปคุยกับคนขาย
   เพื่อจับว่าเป็น AI บอทที่โจรตั้งไว้เฝ้ารถขโมย
───────────────────────────────────────────── */

const FLAGS = [
  { id: 1, Icon: Zap,    label: 'ตอบเร็ว <2 วิ ตลอด 24 ชม.' },
  { id: 2, Icon: Copy,   label: 'ใช้ประโยคซ้ำ (>85%)' },
  { id: 3, Icon: Banknote, label: 'เร่ง "พร้อมโอน" ใน 3 ข้อความแรก' },
  { id: 4, Icon: FileX,  label: 'เลี่ยงเลขตัวถัง / นัดดูรถ' },
  { id: 5, Icon: Users,  label: 'ทำงานหลายแชทพร้อมกัน' },
];

const QUICK = ['ขอดูเล่มทะเบียน', 'ขอเลขตัวถัง (VIN)', 'นัดดูรถพรุ่งนี้', 'รถจอดอยู่ไหน'];

const AVOID = ['เล่ม', 'ทะเบียน', 'เอกสาร', 'นัดดู', 'ดูรถ', 'มาดู', 'เลขตัวถัง', 'vin', 'อยู่ไหน', 'โอนชื่อ', 'ตัวถัง'];

const REPLY = {
  transfer: 'ราคานี้พร้อมโอนวันนี้ ลดให้อีก 5,000 นะครับ พร้อมโอนเลยไหมครับ',
  urgency:  'มีคนทักมาเยอะ รถสวยรีบตัดสินใจนะครับ',
  avoid:    'ไม่สะดวกให้ดูเล่ม/นัดดูก่อนนะครับ มัดจำมาก่อนได้เลย',
};

function Flag({ flag, on }) {
  const { Icon } = flag;
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-300 ${
      on
        ? 'bg-red-500/12 sm:bg-red-50 border border-red-500/30 sm:border-red-200'
        : 'bg-[#1a1a1a] sm:bg-slate-50 border border-transparent'
    }`}>
      <Icon className={`w-4 h-4 flex-shrink-0 ${on ? 'text-red-400 sm:text-red-500' : 'text-[#555] sm:text-slate-400'}`} />
      <span className={`flex-1 text-[11.5px] leading-tight ${on ? 'text-red-300 sm:text-red-700 font-medium' : 'text-[#888] sm:text-slate-500'}`}>{flag.label}</span>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${on ? 'bg-red-500 animate-pulse' : 'bg-[#333] sm:bg-slate-300'}`} />
    </div>
  );
}

export default function BrokerBotCard({ onLoginSave }) {
  const [messages, setMessages] = useState([{ who: 'bot', text: 'สนใจรุ่นไหนครับ รถสวยเจ้าของขายเอง' }]);
  const [input, setInput] = useState('');
  const [flags, setFlags] = useState({ 1: false, 2: false, 3: false, 4: false, 5: false });
  const botLog = useRef(['สนใจรุ่นไหนครับ รถสวยเจ้าของขายเอง']);
  const replyCount = useRef(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const trigger = (n) => setFlags(prev => prev[n] ? prev : { ...prev, [n]: true });

  const riskCount = Object.values(flags).filter(Boolean).length;
  const pct = riskCount * 20;
  const riskColor = pct === 0 ? '#666' : pct <= 40 ? '#f59e0b' : pct <= 80 ? '#f97316' : '#ef4444';
  const riskText =
    pct === 0  ? 'ทักไปคุยเพื่อเริ่มสืบ...' :
    pct <= 40  ? 'เริ่มมีพฤติกรรมน่าสงสัย' :
    pct <= 80  ? 'เสี่ยงสูง — น่าจะเป็นบอทเฝ้ารถ' :
                 '🔴 ครบ 5 สัญญาณ — บอทเฝ้ารถขโมย';

  const botReply = (text) => {
    const lower = text.toLowerCase();
    replyCount.current += 1;
    if (AVOID.some(k => lower.includes(k))) { trigger(4); return REPLY.avoid; }
    if (replyCount.current === 1) return REPLY.transfer;
    if (replyCount.current === 2) return REPLY.urgency;
    return REPLY.transfer;
  };

  const send = (text) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setInput('');
    setMessages(prev => [...prev, { who: 'user', text: t }]);
    setTimeout(() => {
      const r = botReply(t);
      botLog.current.push(r);
      setMessages(prev => [...prev, { who: 'bot', text: r }]);
      trigger(1);
      if (botLog.current.filter(m => m.includes('พร้อมโอน')).length >= 2) trigger(2);
      if (botLog.current.slice(0, 3).some(m => m.includes('พร้อมโอน'))) trigger(3);
      trigger(5);
    }, 420 + Math.random() * 250);
  };

  return (
    <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-[#2a2a2a] sm:border-slate-200 shadow-lg bg-[#141414] sm:bg-white">

      {/* Header */}
      <div className="bg-[#1a1a1a] sm:bg-gradient-to-r sm:from-slate-900 sm:to-slate-800 border-b border-[#2a2a2a] sm:border-b-0 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#f9597b]/15 sm:bg-white/10 flex items-center justify-center flex-shrink-0">
          <Search className="w-4 h-4 text-[#f9597b] sm:text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold tracking-wide">ล่อบอทเฝ้ารถ · Broker Bot Detector</p>
          <p className="text-[#8a8a8a] sm:text-slate-400 text-[11px] mt-0.5 truncate">แกล้งเป็นผู้ซื้อ ทักประกาศต้องสงสัย</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[#c2c2c2] sm:text-slate-300 font-medium flex-shrink-0">LIVE</span>
      </div>

      <div className="p-4 space-y-3">

        {/* Intro */}
        <p className="text-[11px] text-[#a8a8a8] sm:text-slate-500 leading-snug">
          เจอประกาศคล้ายรถที่หาย? <span className="text-[#f9597b] font-medium">อย่าเพิ่งโทรแจ้ง</span> — ลองทักไปคุยเหมือนผู้ซื้อ ระบบจะจับว่าคนขายเป็นบอทที่โจรตั้งไว้ไหม
        </p>

        {/* Chat window */}
        <div ref={scrollRef} className="bg-[#0d0d0d] sm:bg-slate-50 rounded-xl border border-[#222] sm:border-slate-100 p-3 max-h-44 overflow-y-auto space-y-2">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.who === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[80%] px-3 py-2 text-[12px] leading-snug ${
                m.who === 'user'
                  ? 'bg-gradient-to-br from-[#f9597b] to-[#c9468f] text-white rounded-2xl rounded-br-md'
                  : 'bg-[#1f1f1f] sm:bg-white text-[#e0e0e0] sm:text-slate-700 border border-[#2a2a2a] sm:border-slate-100 rounded-2xl rounded-bl-md'
              }`}>{m.text}</div>
            </div>
          ))}
        </div>

        {/* Quick chips */}
        <div className="flex gap-1.5 flex-wrap">
          {QUICK.map(q => (
            <button key={q} onClick={() => send(q)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-[#1a1a1a] sm:bg-slate-100 text-[#c2c2c2] sm:text-slate-600 border border-[#2a2a2a] sm:border-slate-200 hover:border-[#f9597b] active:scale-95 transition-all">
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(); }}
            maxLength={120}
            placeholder="พิมพ์ในฐานะผู้ซื้อ..."
            className="flex-1 bg-[#1a1a1a] sm:bg-slate-100 text-white sm:text-slate-800 text-[13px] rounded-full px-4 py-2 outline-none placeholder:text-[#555] sm:placeholder:text-slate-400 border border-[#2a2a2a] sm:border-transparent focus:border-[#f9597b]"
          />
          <button onClick={() => send()} aria-label="ส่ง"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f9597b] to-[#c9468f] text-white flex items-center justify-center flex-shrink-0 active:scale-95 transition-all">
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Detection panel */}
        <div className="pt-3 border-t border-[#222] sm:border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#c2c2c2] sm:text-slate-700 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-[#f9597b]" /> แผงตรวจจับ AI
            </span>
            <span className="text-xl font-black" style={{ color: riskColor }}>{pct}%</span>
          </div>
          <div className="h-2.5 bg-[#222] sm:bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: riskColor }} />
          </div>
          <p className="text-[11px] text-center font-medium" style={{ color: pct > 0 ? riskColor : undefined }}>
            {riskText}
          </p>
          <div className="space-y-1.5">
            {FLAGS.map(f => <Flag key={f.id} flag={f} on={flags[f.id]} />)}
          </div>
        </div>

        {/* CTA */}
        {riskCount >= 3 && (
          <>
            <div className="relative rounded-xl border border-[#2a2a2a] sm:border-slate-100 overflow-hidden">
              <div className="px-3 py-2 space-y-2 select-none pointer-events-none">
                <div className="h-3 bg-[#2a2a2a] sm:bg-slate-200 rounded-full w-3/4 blur-sm" />
                <div className="h-3 bg-[#2a2a2a] sm:bg-slate-200 rounded-full w-full blur-sm" />
              </div>
              <div className="absolute inset-0 bg-[#141414]/70 sm:bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1">
                <Lock className="w-4 h-4 text-[#8a8a8a] sm:text-slate-400" />
                <p className="text-[11px] text-[#a8a8a8] sm:text-slate-500 font-medium">รายงานหลักฐาน + ลิงก์ส่งทีมสืบ</p>
              </div>
            </div>
            <button
              onClick={onLoginSave}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#f9597b] to-[#c9468f] sm:from-blue-600 sm:to-cyan-500 hover:from-[#e0486a] hover:to-[#b03d7e] text-white rounded-xl py-3 px-4 text-sm font-bold shadow-lg shadow-[#f9597b]/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Save className="w-4 h-4" />
              บันทึกหลักฐานแชทนี้ → เข้าสู่ระบบ
              <ChevronRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[11px] text-[#666] sm:text-slate-400">ฟรี · เก็บบทแชทเป็นหลักฐาน · ส่งต่อทีมสืบได้</p>
          </>
        )}

      </div>
    </div>
  );
}
