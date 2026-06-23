import React, { useState } from 'react';
import {
  ShieldCheck, Siren, FileDown, Share2, Lock, MapPin, QrCode,
  Film, Sun, Scan, MessageSquare, Zap, Banknote, FileX, Layers,
  TrendingDown, Flame, Megaphone, CheckCircle2, X, AlertTriangle,
} from 'lucide-react';
import BetaBanner from './BetaBanner';

/* ─────────────────────────────────────────────
   7kilo Protect — Dashboard เต็ม (DEMO / ตัวอย่าง)
   ทุกผลเป็น "เคสตัวอย่าง" ไม่ใช่รถลูกค้าจริง
   รอ backend จริงค่อยแสดงข้อมูลจริง
───────────────────────────────────────────── */

const SAMPLE = {
  car: 'Honda Wave 125i สีดำ · ทะเบียน 1กข 1234 กทม.',
  forensicScore: 70,
  behaviorScore: 80,
};
const TOTAL = SAMPLE.forensicScore + SAMPLE.behaviorScore;

// เกจครึ่ง/วงแหวน ด้วย conic-gradient
function RingGauge({ value, max, size = 88, color = '#f9597b' }) {
  const deg = Math.min(360, (value / max) * 360);
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(${color} ${deg}deg, #2a2a2a 0deg)` }} />
      <div className="absolute inset-[8px] rounded-full bg-[#141414] sm:bg-white flex flex-col items-center justify-center">
        <span className="text-xl font-black text-white sm:text-slate-800 leading-none">{value}</span>
        <span className="text-[10px] text-[#666] sm:text-slate-400">/{max}</span>
      </div>
    </div>
  );
}

function SectionHead({ n, title, sub, color = '#f9597b' }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: color }}>{n}</div>
      <div className="min-w-0">
        <h2 className="text-base font-extrabold text-white sm:text-slate-800 leading-tight">{title}</h2>
        <p className="text-[11px] text-[#888] sm:text-slate-500 truncate">{sub}</p>
      </div>
      <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-[#f9597b]/15 text-[#f9597b] font-bold flex-shrink-0">ตัวอย่าง</span>
    </div>
  );
}

const card = 'rounded-2xl border border-[#2a2a2a] sm:border-slate-200 bg-[#141414] sm:bg-white';

export default function TakedownDashboard() {
  const [seizureOpen, setSeizureOpen] = useState(false);
  const [seizureId, setSeizureId] = useState(null);
  const [ayatMap, setAyatMap] = useState(false);

  const genSeizure = () => setSeizureId('SZ-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000));

  return (
    <main className="flex-1 overflow-y-auto bg-[#0a0a0a] sm:bg-slate-50 px-4 sm:px-6 py-5 pb-24">
      <div className="max-w-3xl mx-auto space-y-4">

        <BetaBanner compact />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f9597b] flex items-center justify-center text-white text-sm font-black">7</div>
            <div>
              <p className="text-sm font-bold text-white sm:text-slate-800 leading-none">🕵️ GUMSHOE-95</p>
              <p className="text-[10px] text-[#888] sm:text-slate-500 font-mono">ตัวอย่างเคส</p>
            </div>
          </div>
          <button onClick={() => { setSeizureOpen(true); if (!seizureId) genSeizure(); }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#f9597b] to-[#c9468f] text-white text-xs font-bold px-3 h-9 rounded-xl active:scale-95 transition">
            <Siren className="w-3.5 h-3.5" /> แจ้งอายัด
          </button>
        </div>

        {/* Hero */}
        <div className={`${card} p-5 text-center`}>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#f9597b] bg-[#f9597b]/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f9597b] animate-pulse" /> ย้อนยุค Win95 (กำลังพัฒนา)
          </span>
          <h1 className="mt-3 text-2xl font-black text-white sm:text-slate-800">รถหาย? <span className="text-[#f9597b]">ตรวจครบใน 30 วิ</span></h1>
          <p className="mt-1 text-xs text-[#a8a8a8] sm:text-slate-500">{SAMPLE.car}</p>
        </div>

        {/* SECTION 1 — Forensics */}
        <div className={`${card} p-4`}>
          <SectionHead n="1" title="VIDEO.SCAN — ตรวจคลิป" sub="ตรวจคลิปตัดต่อ · แสง-เงา · การสะท้อน" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { Icon: Film, label: 'Metadata', val: 'Encoder ตัดต่อ', bad: true },
              { Icon: Sun, label: 'แสง-เงา', val: 'Std 0.42 ไม่เสถียร', bad: true },
              { Icon: Scan, label: 'การสะท้อน', val: 'ระยะสี 68 ไม่มีเงา', bad: true },
            ].map((x, i) => (
              <div key={i} className="bg-[#1a1a1a] sm:bg-slate-50 rounded-xl p-3">
                <x.Icon className="w-4 h-4 text-[#f9597b] mb-1" />
                <p className="text-[11px] font-semibold text-white sm:text-slate-700">{x.label}</p>
                <p className="text-[10px] text-red-400 sm:text-red-500">{x.val}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 bg-[#1a1a1a] sm:bg-slate-50 rounded-xl p-3">
            <div>
              <p className="text-[11px] text-[#888] sm:text-slate-500">คะแนน Forensics</p>
              <p className="text-lg font-black text-white sm:text-slate-800">เสี่ยง<span className="text-red-400 sm:text-red-500">สูง</span> · พบ 3/3</p>
            </div>
            <RingGauge value={SAMPLE.forensicScore} max={100} size={72} color="#ef4444" />
          </div>
        </div>

        {/* SECTION 2 — Behavior */}
        <div className={`${card} p-4`}>
          <SectionHead n="2" title="พฤติกรรมรีบขาย" sub="ราคา · คำเร่ง · โพสต์ซ้ำ · ยิงแอด" color="#f59e0b" />
          <div className="flex items-center gap-4 mb-3">
            <RingGauge value={SAMPLE.behaviorScore} max={100} size={72} color="#f59e0b" />
            <div>
              <p className="text-xs text-[#888] sm:text-slate-500">คะแนนเร่งขาย</p>
              <p className="text-base font-black text-white sm:text-slate-800">เสี่ยงสูง</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { Icon: TrendingDown, t: 'ราคาต่ำกว่าตลาด 25%', d: 'ตลาด 43,000 · ขาย 32,000' },
              { Icon: Flame, t: 'ใช้คำเร่ง 3 คำ', d: 'ด่วน · พร้อมโอนวันนี้ · มัดจำก่อน' },
              { Icon: Megaphone, t: 'ยิงแอด ~1,200/วัน', d: 'เร่งปิดการขายผิดปกติ' },
              { Icon: Layers, t: 'โพสต์ซ้ำ 4 กลุ่ม / 2.1 ชม.', d: '' },
            ].map((x, i) => (
              <div key={i} className="flex items-start gap-2 bg-[#1a1a1a] sm:bg-slate-50 rounded-xl px-3 py-2">
                <x.Icon className="w-3.5 h-3.5 text-[#f9597b] flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white sm:text-slate-700">{x.t}</p>
                  {x.d && <p className="text-[10px] text-[#888] sm:text-slate-400">{x.d}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3 — Bot chatbot */}
        <div className={`${card} p-4`}>
          <SectionHead n="3" title="จับบอทนายหน้า" sub="แชทตอบไวผิดปกติ · เลี่ยงเอกสาร" />
          <div className="bg-[#0d0d0d] sm:bg-slate-50 rounded-xl border border-[#222] sm:border-slate-100 p-3 space-y-2">
            <div className="flex justify-end"><div className="bg-gradient-to-br from-[#f9597b] to-[#c9468f] text-white text-[12px] px-3 py-1.5 rounded-2xl rounded-br-md max-w-[80%]">ขอดูเล่มทะเบียนได้ไหมครับ</div></div>
            <div className="flex justify-start"><div className="bg-[#1f1f1f] sm:bg-white text-[#e0e0e0] sm:text-slate-700 border border-[#2a2a2a] sm:border-slate-100 text-[12px] px-3 py-1.5 rounded-2xl rounded-bl-md max-w-[80%]">โทรคุยดีกว่าครับ มัดจำก่อนได้เลย</div></div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { Icon: Zap, t: 'ตอบเร็ว <2 วิ' },
              { Icon: Banknote, t: 'เร่ง "พร้อมโอน"' },
              { Icon: FileX, t: 'เลี่ยงเล่ม/VIN' },
              { Icon: Lock, t: 'เร่งให้มัดจำ' },
            ].map((x, i) => (
              <div key={i} className="flex items-center gap-2 bg-red-500/10 sm:bg-red-50 border border-red-500/25 sm:border-red-100 rounded-lg px-2.5 py-2">
                <x.Icon className="w-3.5 h-3.5 text-red-400 sm:text-red-500 flex-shrink-0" />
                <span className="text-[11px] text-red-300 sm:text-red-700 font-medium">{x.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4 — Takedown */}
        <div className={`${card} p-4`}>
          <SectionHead n="4" title="แจ้งถอดโพสต์" sub="สแกน 4 แพลตฟอร์มพร้อมกัน" color="#f59e0b" />
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { v: 18, l: 'พบโพสต์', c: 'bg-[#1a1a1a] sm:bg-slate-800 text-white' },
              { v: 12, l: 'ลบสำเร็จ', c: 'bg-emerald-500 text-white' },
              { v: 6, l: 'กำลังตาม', c: 'bg-amber-500 text-white' },
            ].map((x, i) => (
              <div key={i} className={`rounded-xl p-3 text-center ${x.c}`}>
                <p className="text-2xl font-black leading-none">{x.v}</p>
                <p className="text-[10px] opacity-90 mt-1">{x.l}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[
              { tag: 'f', color: '#1877F2', name: 'Facebook', removed: 5, found: 7 },
              { tag: 'K', color: '#FF6600', name: 'Kaidee', removed: 3, found: 5 },
              { tag: 'T', color: '#f9597b', name: 'Taladrod', removed: 3, found: 4 },
              { tag: 'IG', color: '#E1306C', name: 'Instagram', removed: 1, found: 2 },
            ].map((x, i) => (
              <div key={i} className="flex items-center justify-between bg-[#1a1a1a] sm:bg-slate-50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold" style={{ background: x.color }}>{x.tag}</span>
                  <span className="text-xs font-medium text-white sm:text-slate-700">{x.name}</span>
                </div>
                <span className="text-[11px]"><span className="text-emerald-400 sm:text-emerald-600 font-bold">ลบ {x.removed}</span> <span className="text-[#888] sm:text-slate-400">/ พบ {x.found}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5 — Summary */}
        <div className="rounded-2xl bg-gradient-to-br from-[#f9597b] to-[#c9468f] p-[1.5px]">
          <div className="rounded-2xl bg-[#141414] sm:bg-white p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <RingGauge value={TOTAL} max={200} size={120} color="#f9597b" />
              <div className="flex-1">
                <span className="text-[11px] font-bold text-[#f9597b]">สรุปความเสี่ยงรวม</span>
                <h2 className="text-lg font-black text-white sm:text-slate-800 leading-tight mt-1">เสี่ยงสูงมาก — น่าจะเป็นรถขโมย</h2>
                <p className="text-[11px] text-[#888] sm:text-slate-500 mt-1">คะแนนรวมจาก 4 ชั้น · แนะนำแจ้งอายัด</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button className="flex items-center gap-1.5 h-10 px-4 bg-[#1f1f1f] sm:bg-slate-800 text-white text-xs font-semibold rounded-xl active:scale-95 transition"><FileDown className="w-4 h-4" /> ส่งออก PDF</button>
              <button onClick={() => { setSeizureOpen(true); if (!seizureId) genSeizure(); }} className="flex items-center gap-1.5 h-10 px-4 bg-gradient-to-r from-[#f9597b] to-[#c9468f] text-white text-xs font-bold rounded-xl active:scale-95 transition"><Siren className="w-4 h-4" /> แจ้งอายัดเลย</button>
              <button className="flex items-center gap-1.5 h-10 px-4 border border-[#2a2a2a] sm:border-slate-200 text-[#c2c2c2] sm:text-slate-600 text-xs font-medium rounded-xl active:scale-95 transition"><Share2 className="w-4 h-4" /> แชร์</button>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#555] sm:text-slate-400 pt-2">
          ตัวอย่างระบบ (Beta) · ไม่ใช่หน่วยงานราชการ · ผลที่แสดงเป็นเคสตัวอย่าง
        </p>
      </div>

      {/* Seizure Modal */}
      {seizureOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSeizureOpen(false)} />
          <div className="relative w-full max-w-md mt-8 sm:mt-0 rounded-2xl overflow-hidden bg-[#141414] sm:bg-white border border-[#2a2a2a] sm:border-slate-200">
            <div className="bg-gradient-to-r from-[#f9597b] to-[#c9468f] px-5 py-4 flex items-start justify-between">
              <div>
                <h3 className="text-white font-black text-lg">แจ้งอายัดรถหาย</h3>
                <p className="text-white/80 text-[11px]">ออกเลขที่อายัด + QR (ตัวอย่าง)</p>
              </div>
              <button onClick={() => setSeizureOpen(false)} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-2 bg-amber-500/10 sm:bg-amber-50 border border-amber-500/20 sm:border-amber-100 rounded-xl px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 sm:text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-300 sm:text-amber-700">ระบบกำลังพัฒนาช่องทางประสานตำรวจ — ขั้นตอนนี้เป็นตัวอย่าง ยังไม่ส่งข้อมูลจริง</p>
              </div>
              <div>
                <label className="text-[11px] text-[#888] sm:text-slate-500">ทะเบียนรถ</label>
                <input defaultValue="1กข 1234 กทม" className="mt-1 w-full h-10 px-3 rounded-xl bg-[#1a1a1a] sm:bg-slate-50 border border-[#2a2a2a] sm:border-slate-200 text-white sm:text-slate-800 text-sm font-semibold outline-none focus:border-[#f9597b]" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-32 h-32 rounded-2xl bg-white p-2 flex items-center justify-center">
                  {/* QR placeholder (ตัวอย่าง) */}
                  <div className="grid grid-cols-5 gap-1 w-full h-full">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className={`rounded-[2px] ${[0,1,2,4,5,9,10,12,14,15,19,20,21,22,24,6,8,16,18,11].includes(i) ? 'bg-slate-900' : 'bg-transparent'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#888] sm:text-slate-500"><QrCode className="w-3 h-3" /> สแกนตรวจสอบสถานะ (ตัวอย่าง)</div>
                {seizureId && (
                  <div className="w-full bg-[#1a1a1a] sm:bg-slate-50 rounded-xl px-3 py-2 text-center">
                    <p className="text-[10px] text-[#888] sm:text-slate-500">เลขที่อายัด (ตัวอย่าง)</p>
                    <p className="text-base font-black text-white sm:text-slate-800 tracking-wide">{seizureId}</p>
                  </div>
                )}
              </div>
              <p className="text-center text-[10px] text-[#555] sm:text-slate-400">ตัวอย่างระบบ · ยังไม่มีการส่งข้อมูลไปหน่วยงานใด</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
