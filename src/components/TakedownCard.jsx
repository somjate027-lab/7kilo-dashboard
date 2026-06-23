import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Loader2, CheckCircle2, Circle,
  Lock, Save, ChevronRight, MapPin, FileDown, Radar,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Takedown Teaser Card (guest) — 7kilo Protect
   โชว์ "เจอรถคุณถูกโพสต์ขายซ้ำ N ที่" → ล่อ login
   ของจริง (สั่งถอด/อายัด/PDF) อยู่หลัง login
───────────────────────────────────────────── */

const PLATFORMS = [
  { key: 'facebook', label: 'Facebook Marketplace', color: '#1877F2', tag: 'f',  found: 3, delay: 0    },
  { key: 'kaidee',   label: 'Kaidee',               color: '#FF6600', tag: 'K',  found: 1, delay: 800  },
  { key: 'taladrod', label: 'Taladrod.com',         color: '#f9597b', tag: 'T',  found: 2, delay: 1600 },
  { key: 'instagram',label: 'Instagram',            color: '#E1306C', tag: 'IG', found: 1, delay: 2400 },
];

const TOTAL = PLATFORMS.reduce((a, p) => a + p.found, 0); // 7

const LOCKED = [
  { platform: 'Facebook Marketplace', tag: 'f',  color: '#1877F2', sim: 94 },
  { platform: 'Taladrod.com',         tag: 'T',  color: '#f9597b', sim: 92 },
  { platform: 'Kaidee',               tag: 'K',  color: '#FF6600', sim: 89 },
];

export default function TakedownCard({ onLoginSave }) {
  const [phase, setPhase] = useState('scanning');
  const [scanned, setScanned] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    PLATFORMS.forEach(({ key, delay }) => {
      setTimeout(() => setScanned(prev => ({ ...prev, [key]: true })), delay);
    });
    const totalDelay = PLATFORMS[PLATFORMS.length - 1].delay + 900;
    setTimeout(() => {
      setPhase('result');
      setTimeout(() => setShowResult(true), 100);
      // count up to TOTAL
      let c = 0;
      const t = setInterval(() => { c += 1; setCount(c); if (c >= TOTAL) clearInterval(t); }, 120);
    }, totalDelay);
  }, []);

  return (
    <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-[#2a2a2a] sm:border-slate-200 shadow-lg bg-[#141414] sm:bg-white">

      {/* Header */}
      <div className="bg-[#1a1a1a] sm:bg-gradient-to-r sm:from-slate-900 sm:to-slate-800 border-b border-[#2a2a2a] sm:border-b-0 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#f9597b]/15 sm:bg-white/10 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#f9597b] sm:text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold tracking-wide">ระบบ Takedown · 7kilo Protect</p>
          <p className="text-[#8a8a8a] sm:text-slate-400 text-[11px] mt-0.5 truncate">AI Visual Match · ตามล่ารูปรถที่ถูกโพสต์ขาย</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[#c2c2c2] sm:text-slate-300 font-medium flex-shrink-0">ตัวอย่าง</span>
      </div>

      <div className="p-4 space-y-4">

        {/* Phase: SCANNING */}
        {phase === 'scanning' && (
          <div className="space-y-2">
            <p className="text-xs text-[#a8a8a8] sm:text-slate-500 font-medium flex items-center gap-1.5">
              <Radar className="w-3.5 h-3.5 animate-spin text-[#f9597b] sm:text-indigo-500" />
              สแกนหารูปรถคุณข้ามแพลตฟอร์ม...
            </p>
            {PLATFORMS.map(({ key, label, color, tag, found }) => {
              const done = scanned[key];
              return (
                <div key={key} className="flex items-center gap-2.5 py-1.5">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: color }}>{tag}</div>
                  <span className={`text-xs flex-1 ${done ? 'text-[#e0e0e0] sm:text-slate-700' : 'text-[#666] sm:text-slate-400'}`}>{label}</span>
                  {done
                    ? <span className="text-[11px] font-bold text-red-400 sm:text-red-500">พบ {found}</span>
                    : <Loader2 className="w-3.5 h-3.5 text-[#f9597b] sm:text-indigo-400 animate-spin flex-shrink-0" />
                  }
                </div>
              );
            })}
          </div>
        )}

        {/* Phase: RESULT */}
        {phase === 'result' && showResult && (
          <>
            {/* Big found banner */}
            <div className="text-center py-2">
              <p className="text-xs text-[#a8a8a8] sm:text-slate-500">พบรูปรถคุณถูกนำไปโพสต์ขายซ้ำ</p>
              <p className="text-4xl font-black text-[#f9597b] mt-1">{count} <span className="text-base text-[#888] sm:text-slate-400 font-bold">รายการ</span></p>
              <p className="text-[11px] text-[#777] sm:text-slate-400 mt-1">ความคล้ายสูงสุด 94% · 4 แพลตฟอร์ม</p>
            </div>

            {/* Locked listings */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[#777] sm:text-slate-400 uppercase tracking-wide">ประกาศที่ตรวจพบ</p>
              {LOCKED.map((l, i) => (
                <div key={i} className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#1a1a1a] sm:bg-slate-50 border border-[#2a2a2a] sm:border-slate-100 overflow-hidden">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: l.color }}>{l.tag}</div>
                  <div className="min-w-0 flex-1">
                    <div className="h-2.5 bg-[#2a2a2a] sm:bg-slate-200 rounded-full w-3/4 blur-[3px]" />
                    <div className="h-2 bg-[#2a2a2a] sm:bg-slate-200 rounded-full w-1/2 blur-[3px] mt-1.5" />
                  </div>
                  <span className="text-[11px] font-bold text-red-400 sm:text-red-500 flex-shrink-0">คล้าย {l.sim}%</span>
                  <Lock className="w-3.5 h-3.5 text-[#8a8a8a] sm:text-slate-400 flex-shrink-0" />
                </div>
              ))}
            </div>

            {/* What you unlock */}
            <div className="bg-[#1a1a1a] sm:bg-slate-50 rounded-xl px-3 py-2.5 space-y-1.5">
              <p className="text-[11px] font-bold text-[#777] sm:text-slate-400 uppercase tracking-wide">เข้าสู่ระบบเพื่อปลดล็อก</p>
              {[
                { Icon: ShieldCheck, t: 'สั่งถอดประกาศทั้งหมด (ส่งคำร้องอัตโนมัติ)' },
                { Icon: MapPin,      t: 'แผนที่จุดพบ + แจ้งอายัดกับตำรวจ' },
                { Icon: FileDown,    t: 'รายงาน PDF หลักฐานครบสำหรับคดี' },
              ].map(({ Icon, t }, i) => (
                <p key={i} className="text-xs text-[#c2c2c2] sm:text-slate-600 flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-[#f9597b] flex-shrink-0" /> {t}
                </p>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={onLoginSave}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#f9597b] to-[#c9468f] sm:from-blue-600 sm:to-cyan-500 hover:from-[#e0486a] hover:to-[#b03d7e] text-white rounded-xl py-3 px-4 text-sm font-bold shadow-lg shadow-[#f9597b]/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Save className="w-4 h-4" />
              เข้าสู่ระบบเพื่อสั่งถอด
              <ChevronRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[11px] text-[#666] sm:text-slate-400">
              จ่ายเมื่อถอดประกาศสำเร็จเท่านั้น · ฟรีจนกว่าจะเห็นผล
            </p>
          </>
        )}

      </div>
    </div>
  );
}
