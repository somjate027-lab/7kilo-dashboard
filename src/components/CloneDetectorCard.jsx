import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, ShieldQuestion,
  Search, CheckCircle2, Circle, Loader2,
  AlertTriangle, Lock, Save, ChevronRight,
  Car, ScanSearch,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Clone Detector Scan Card
   แสดงผลสแกนเบื้องต้นใน Center chat
   ก่อน login — ให้ลูกค้า Wow แล้วอยาก save
───────────────────────────────────────────── */

const LAYERS = [
  { key: 'forensics', label: 'Layer 1 · Image Forensics',   sub: 'ตรวจ AI แต่งรูป / เปลี่ยนสี / generate',        delay: 0    },
  { key: 'reverse',   label: 'Layer 2 · เทียบภาพข้ามเว็บ',  sub: 'หาประกาศจากรูป ไม่ใช่คีย์เวิร์ด · Kaidee·FB·One2Car', delay: 800  },
  { key: 'bodymark',  label: 'Layer 3 · จุดพิรุธบนตัวรถ',   sub: 'รอยตำหนิ / สติ๊กเกอร์ลบ / แสงเงาไม่เข้า',      delay: 1600 },
  { key: 'plateangle',label: 'Layer 4 · ทะเบียน + มุมซ้ำ',  sub: 'เพลทเบลอผิดธรรมชาติ / รูปเดิมหมุน-ครอป',       delay: 2400 },
  { key: 'archive',   label: 'Layer 5 · Archive 🖥️',       sub: 'ขุดโพสต์ที่ถูกลบ · ย้อนถึงยุค Win95',          delay: 3200 },
];

function RiskMeter({ score, animate }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!animate) return;
    let start = 0;
    const step = score / 40; // 40 frames
    const timer = setInterval(() => {
      start += step;
      if (start >= score) { setDisplayed(score); clearInterval(timer); }
      else setDisplayed(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [animate, score]);

  const color =
    score >= 70 ? 'from-red-500 to-red-600' :
    score >= 40 ? 'from-amber-400 to-orange-500' :
                  'from-emerald-400 to-emerald-500';
  const textColor =
    score >= 70 ? 'text-red-600' :
    score >= 40 ? 'text-amber-600' :
                  'text-emerald-600';
  const label =
    score >= 70 ? '🔴 ความเสี่ยงสูง' :
    score >= 40 ? '🟡 ความเสี่ยงปานกลาง' :
                  '🟢 ความเสี่ยงต่ำ';

  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between">
        <span className="text-xs font-semibold text-[#8a8a8a] sm:text-slate-500 uppercase tracking-wide">Risk Score</span>
        <span className={`text-2xl font-black ${textColor}`}>{displayed}<span className="text-sm font-semibold text-[#666] sm:text-slate-400">/100</span></span>
      </div>
      <div className="h-3 bg-[#2a2a2a] sm:bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-75`}
          style={{ width: `${animate ? displayed : 0}%` }}
        />
      </div>
      <p className="text-xs font-semibold text-right">{label}</p>
    </div>
  );
}

function SignalRow({ signal, visible }) {
  if (!visible) return null;
  const iconColor =
    signal.level === 'red'    ? 'text-red-500 bg-red-50' :
    signal.level === 'yellow' ? 'text-amber-500 bg-amber-50' :
                                'text-emerald-500 bg-emerald-50';
  const dot =
    signal.level === 'red'    ? '🔴' :
    signal.level === 'yellow' ? '🟡' : '🟢';

  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-[#222] sm:border-slate-50 last:border-0 animate-fade-in">
      <span className="text-base mt-0.5 flex-shrink-0">{dot}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#e0e0e0] sm:text-slate-700 leading-tight">{signal.label}</p>
        {signal.detail && <p className="text-[11px] text-[#777] sm:text-slate-400 mt-0.5 leading-tight">{signal.detail}</p>}
      </div>
    </div>
  );
}

/* ─── 3 กลที่โจรใช้ AI ปลอมรถ — SVG ล้วน เบาๆ ไม่ฝัง base64 ─── */
const CarShape = ({ fill = '#d1d5db', bodyClass = '' }) => (
  <g>
    <path d="M14 38 L26 22 L56 22 L72 32 L88 32 L88 42 L14 42 Z" fill={fill} className={bodyClass} />
    <circle cx="30" cy="43" r="5" fill="#1f2937" />
    <circle cx="76" cy="43" r="5" fill="#1f2937" />
    <circle cx="30" cy="43" r="2" fill="#6b7280" />
    <circle cx="76" cy="43" r="2" fill="#6b7280" />
  </g>
);

function TrickTile({ title, children }) {
  return (
    <div className="rounded-lg border border-[#2a2a2a] sm:border-slate-100 bg-[#111] sm:bg-slate-50 p-1.5 flex flex-col items-center gap-1 overflow-hidden">
      <svg viewBox="0 0 100 64" className="w-full h-auto rounded">{children}</svg>
      <p className="text-[9px] leading-tight text-center text-[#b0b0b0] sm:text-slate-500 font-semibold">{title}</p>
    </div>
  );
}

function CloneTricksDemo() {
  return (
    <div className="space-y-2">
      <style>{`
        @keyframes ct-fa  { 0%,42%{opacity:1} 50%,92%{opacity:0} 100%{opacity:1} }
        @keyframes ct-fb  { 0%,42%{opacity:0} 50%,92%{opacity:1} 100%{opacity:0} }
        @keyframes ct-col { 0%,42%{fill:#d1d5db} 50%,92%{fill:#f9597b} 100%{fill:#d1d5db} }
        .ct-a{animation:ct-fa 4s ease-in-out infinite}
        .ct-b{animation:ct-fb 4s ease-in-out infinite}
        .ct-color{animation:ct-col 4s ease-in-out infinite}
        @media (prefers-reduced-motion: reduce){
          .ct-a,.ct-b,.ct-color{animation:none}
          .ct-b{opacity:0}
        }
      `}</style>

      <p className="text-[11px] font-bold text-[#777] sm:text-slate-400 uppercase tracking-wide">
        🤖 3 กลที่โจรใช้ AI ปลอมรถ
      </p>

      <div className="grid grid-cols-3 gap-2">
        {/* กล 1 — เปลี่ยนสี + ทะเบียน */}
        <TrickTile title="เปลี่ยนสี + ทะเบียน">
          <rect x="0" y="0" width="100" height="64" fill="#0d0d0d" />
          <CarShape bodyClass="ct-color" />
          <rect x="37" y="50" width="26" height="10" rx="1.5" fill="#fff" stroke="#cbd5e1" strokeWidth="0.5" />
          <text x="50" y="57.5" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#111" className="ct-a">กข 1234</text>
          <text x="50" y="57.5" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#111" className="ct-b">นย 5678</text>
        </TrickTile>

        {/* กล 2 — ลบรอยตำหนิ / สติ๊กเกอร์ */}
        <TrickTile title="ลบรอยตำหนิ/สติ๊กเกอร์">
          <rect x="0" y="0" width="100" height="64" fill="#0d0d0d" />
          <CarShape fill="#cbd5e1" />
          {/* สติ๊กเกอร์เดิม (ค่อยๆ ถูกลบ) */}
          <circle cx="48" cy="30" r="4" fill="#ef4444" className="ct-a" />
          {/* AI เติมเนียน (Generative Fill) */}
          <path d="M44 30 L47 33 L52 27" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="ct-b" />
        </TrickTile>

        {/* กล 3 — เปลี่ยนฉากหลัง */}
        <TrickTile title="เปลี่ยนฉากหลัง">
          {/* ฉากบ้านเหยื่อ */}
          <g className="ct-a">
            <rect x="0" y="0" width="100" height="40" fill="#bfdbfe" />
            <rect x="0" y="40" width="100" height="24" fill="#86efac" />
            <rect x="6" y="16" width="22" height="24" fill="#fca5a5" />
            <path d="M5 16 L17 6 L29 16 Z" fill="#dc2626" />
          </g>
          {/* ฉากลานจอดห้าง */}
          <g className="ct-b">
            <rect x="0" y="0" width="100" height="64" fill="#374151" />
            <rect x="10" y="8" width="80" height="18" fill="#4b5563" />
            <rect x="0" y="44" width="100" height="20" fill="#1f2937" />
          </g>
          <CarShape fill="#e5e7eb" />
        </TrickTile>
      </div>

      <p className="text-[10px] text-[#666] sm:text-slate-400 leading-snug">
        → ค้นด้วยคีย์เวิร์ดธรรมดา (สี/ทะเบียน/ที่อยู่) เลย <span className="text-[#f9597b] font-semibold">ไม่เจอ</span> — เราสแกน <span className="text-[#c2c2c2] sm:text-slate-600 font-semibold">"ตัวรถ"</span> ไม่ใช่สิ่งที่ AI ปลอม
      </p>
    </div>
  );
}

export default function CloneDetectorCard({ scanData, onLoginSave }) {
  const [phase, setPhase] = useState('scanning'); // scanning → result
  const [scannedLayers, setScannedLayers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showSignals, setShowSignals] = useState([]);
  const [meterAnimate, setMeterAnimate] = useState(false);

  const totalFound = scanData?.platform_estimates
    ? Object.values(scanData.platform_estimates).reduce((a, b) => a + b, 0)
    : 4;

  // Stage 1 — สแกน 4 ชั้นทีละชั้น
  useEffect(() => {
    LAYERS.forEach(({ key, delay }) => {
      setTimeout(() => {
        setScannedLayers(prev => ({ ...prev, [key]: 'done' }));
      }, delay);
    });
    // เสร็จทุก layer → เปิดผล
    const totalDelay = LAYERS[LAYERS.length - 1].delay + 900;
    setTimeout(() => {
      setPhase('result');
      setTimeout(() => setShowResult(true), 100);
      setTimeout(() => setMeterAnimate(true), 400);
      // เปิด signals ทีละตัว
      (scanData?.signals || []).forEach((_, i) => {
        setTimeout(() => {
          setShowSignals(prev => [...prev, i]);
        }, 600 + i * 250);
      });
    }, totalDelay);
  }, []);

  return (
    <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-[#2a2a2a] sm:border-slate-200 shadow-lg bg-[#141414] sm:bg-white">

      {/* Header */}
      <div className="bg-[#1a1a1a] sm:bg-gradient-to-r sm:from-slate-900 sm:to-slate-800 border-b border-[#2a2a2a] sm:border-b-0 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#f9597b]/15 sm:bg-white/10 flex items-center justify-center flex-shrink-0">
          <ScanSearch className="w-4 h-4 text-[#f9597b] sm:text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold tracking-wide">ผลสแกนเบื้องต้น · Clone Detector</p>
          {(scanData?.plate || scanData?.brand) && (
            <p className="text-[#8a8a8a] sm:text-slate-400 text-[11px] mt-0.5 truncate">
              {[scanData.plate, scanData.brand, scanData.model, scanData.color].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 sm:text-emerald-600 font-mono font-semibold flex-shrink-0 tracking-tight">
          UNDELETE.EXE
        </span>
      </div>

      <div className="p-4 space-y-4">

        {/* ── Phase: SCANNING — 4-Layer Deep Scan ── */}
        {phase === 'scanning' && (
          <div className="space-y-2">
            <p className="text-xs text-[#a8a8a8] sm:text-slate-500 font-medium flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#f9597b] sm:text-indigo-500" />
              🕵️ GUMSHOE-95 รัน UNDELETE.EXE · 5-Layer Deep Scan...
            </p>
            {LAYERS.map(({ key, label, sub }) => {
              const done = scannedLayers[key] === 'done';
              return (
                <div key={key} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all duration-300 ${
                  done
                    ? 'bg-[#1a1a1a] sm:bg-white border-[#2a2a2a] sm:border-slate-100'
                    : 'bg-transparent border-transparent opacity-60'
                }`}>
                  {done
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    : <Loader2 className="w-4 h-4 text-[#f9597b] sm:text-indigo-400 flex-shrink-0 animate-spin" />
                  }
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold leading-tight ${done ? 'text-[#e0e0e0] sm:text-slate-700' : 'text-[#888] sm:text-slate-500'}`}>{label}</p>
                    <p className="text-[10px] text-[#666] sm:text-slate-400 truncate">{sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Phase: RESULT ── */}
        {phase === 'result' && showResult && (
          <>
            {/* Summary banner */}
            {scanData?.top_risk_reason && (
              <div className="flex items-start gap-2 bg-red-500/10 sm:bg-red-50 border border-red-500/30 sm:border-red-100 rounded-xl px-3 py-2">
                <AlertTriangle className="w-4 h-4 text-red-400 sm:text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 sm:text-red-700 font-medium leading-snug">{scanData.top_risk_reason}</p>
              </div>
            )}

            {/* Risk Meter */}
            <RiskMeter score={scanData?.risk_score ?? 0} animate={meterAnimate} />

            {/* Layer summary */}
            <div className="flex items-center justify-between bg-[#1a1a1a] sm:bg-slate-50 rounded-xl px-3 py-2.5">
              <span className="text-xs text-[#8a8a8a] sm:text-slate-500">พบพิรุธจาก 5-Layer scan</span>
              <span className="text-sm font-black text-white sm:text-slate-800">
                {totalFound} <span className="text-xs font-semibold text-[#666] sm:text-slate-400">จุด / 5 ชั้นตรวจ</span>
              </span>
            </div>

            {/* Scanned layers recap — ให้ Layer 5 Archive คงอยู่ในผล */}
            <div className="space-y-1">
              {LAYERS.map(({ key, label, sub }) => (
                <div key={key} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-[#c2c2c2] sm:text-slate-600">{label}</span>
                  <span className="text-[10px] text-[#666] sm:text-slate-400 truncate">· {sub}</span>
                </div>
              ))}
            </div>

            {/* 3 กลที่โจรใช้ AI ปลอมรถ — SVG animation เบาๆ */}
            <CloneTricksDemo />

            {/* Signals */}
            <div className="space-y-0">
              <p className="text-[11px] font-bold text-[#777] sm:text-slate-400 uppercase tracking-wide mb-1">สัญญาณที่ตรวจพบ</p>
              {(scanData?.signals || []).map((signal, i) => (
                <SignalRow key={i} signal={signal} visible={showSignals.includes(i)} />
              ))}
            </div>

            {/* Blurred deep result */}
            <div className="relative rounded-xl border border-[#2a2a2a] sm:border-slate-100 overflow-hidden">
              <div className="px-3 py-2 space-y-2 select-none pointer-events-none">
                <div className="h-3 bg-[#2a2a2a] sm:bg-slate-200 rounded-full w-3/4 blur-sm" />
                <div className="h-3 bg-[#2a2a2a] sm:bg-slate-200 rounded-full w-full blur-sm" />
                <div className="h-3 bg-[#2a2a2a] sm:bg-slate-200 rounded-full w-2/3 blur-sm" />
                <div className="flex gap-2">
                  <div className="h-8 w-12 bg-[#2a2a2a] sm:bg-slate-200 rounded blur-sm" />
                  <div className="h-8 flex-1 bg-[#2a2a2a] sm:bg-slate-200 rounded blur-sm" />
                </div>
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-[#141414]/70 sm:bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1">
                <Lock className="w-4 h-4 text-[#8a8a8a] sm:text-slate-400" />
                <p className="text-[11px] text-[#a8a8a8] sm:text-slate-500 font-medium">ลิงก์ประกาศ + หลักฐานเต็ม</p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={onLoginSave}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#f9597b] to-[#c9468f] sm:from-blue-600 sm:to-cyan-500 hover:from-[#e0486a] hover:to-[#b03d7e] sm:hover:from-blue-700 sm:hover:to-cyan-600 text-white rounded-xl py-3 px-4 text-sm font-bold shadow-lg shadow-[#f9597b]/25 sm:shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Save className="w-4 h-4" />
              บันทึกผลลัพธ์นี้ → เข้าสู่ระบบ
              <ChevronRight className="w-4 h-4" />
            </button>

            <p className="text-center text-[11px] text-[#666] sm:text-slate-400">
              ฟรี · บันทึกได้ทันที · เปิดดูได้ทุกเมื่อ
            </p>
          </>
        )}

      </div>
    </div>
  );
}
