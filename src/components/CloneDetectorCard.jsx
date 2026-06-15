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

const PLATFORMS = [
  { key: 'kaidee',   label: 'Kaidee.com',           delay: 0    },
  { key: 'one2car',  label: 'One2Car.com',           delay: 700  },
  { key: 'facebook', label: 'Facebook Marketplace',  delay: 1500 },
  { key: 'tarad',    label: 'ตลาดรถ.com',            delay: 2200 },
  { key: 'pantip',   label: 'Pantip ซื้อขาย',        delay: 2900 },
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

export default function CloneDetectorCard({ scanData, onLoginSave }) {
  const [phase, setPhase] = useState('scanning'); // scanning → result
  const [scannedPlatforms, setScannedPlatforms] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showSignals, setShowSignals] = useState([]);
  const [meterAnimate, setMeterAnimate] = useState(false);

  const totalFound = scanData?.platform_estimates
    ? Object.values(scanData.platform_estimates).reduce((a, b) => a + b, 0)
    : 4;

  // Stage 1 — scan platforms ทีละตัว
  useEffect(() => {
    PLATFORMS.forEach(({ key, delay }) => {
      setTimeout(() => {
        setScannedPlatforms(prev => ({ ...prev, [key]: 'done' }));
      }, delay);
    });
    // เสร็จสแกนทุกแพลตฟอร์ม → เปิดผล
    const totalDelay = PLATFORMS[PLATFORMS.length - 1].delay + 800;
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
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[#c2c2c2] sm:text-slate-300 font-medium flex-shrink-0">
          AI Analysis
        </span>
      </div>

      <div className="p-4 space-y-4">

        {/* ── Phase: SCANNING ── */}
        {phase === 'scanning' && (
          <div className="space-y-2">
            <p className="text-xs text-[#a8a8a8] sm:text-slate-500 font-medium flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#f9597b] sm:text-indigo-500" />
              กำลังสแกนข้ามแพลตฟอร์ม...
            </p>
            {PLATFORMS.map(({ key, label }) => {
              const done = scannedPlatforms[key] === 'done';
              const count = scanData?.platform_estimates?.[key] ?? 0;
              return (
                <div key={key} className="flex items-center gap-2.5 py-1">
                  {done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    : <Circle className="w-3.5 h-3.5 text-[#444] sm:text-slate-300 flex-shrink-0 animate-pulse" />
                  }
                  <span className={`text-xs flex-1 ${done ? 'text-[#e0e0e0] sm:text-slate-700' : 'text-[#666] sm:text-slate-400'}`}>{label}</span>
                  {done && (
                    <span className={`text-[11px] font-semibold ${count > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {count > 0 ? `พบ ${count}` : 'ไม่พบ'}
                    </span>
                  )}
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

            {/* Platform summary */}
            <div className="flex items-center justify-between bg-[#1a1a1a] sm:bg-slate-50 rounded-xl px-3 py-2.5">
              <span className="text-xs text-[#8a8a8a] sm:text-slate-500">พบประกาศที่ตรงเงื่อนไข</span>
              <span className="text-sm font-black text-white sm:text-slate-800">
                {totalFound} <span className="text-xs font-semibold text-[#666] sm:text-slate-400">ประกาศ / 5 แพลตฟอร์ม</span>
              </span>
            </div>

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
