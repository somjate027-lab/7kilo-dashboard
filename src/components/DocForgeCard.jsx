import React, { useState, useEffect } from 'react';
import {
  FileWarning, CheckCircle2, XCircle, AlertCircle,
  Loader2, Lock, Save, ChevronRight, ScanSearch,
  FileText, Fingerprint, Microscope,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Doc Forge Scan Card
   ตรวจสอบความน่าเชื่อถือของเอกสารรถ
   Hook: Authenticity Score + จุดผิดปกติในเอกสาร
───────────────────────────────────────────── */

const SCAN_STEPS = [
  { key: 'font',      label: 'ตรวจฟอนต์และ layout',             delay: 0    },
  { key: 'stamp',     label: 'ตรวจตราประทับกรมขนส่ง',            delay: 700  },
  { key: 'vin',       label: 'ตรวจเลขตัวถัง VIN',               delay: 1400 },
  { key: 'watermark', label: 'ตรวจ watermark และ security',       delay: 2100 },
  { key: 'pixel',     label: 'วิเคราะห์ pixel artifact (AI/PS)', delay: 2900 },
];

function AuthMeter({ score, animate }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!animate) return;
    let start = 0;
    const step = score / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= score) { setDisplayed(score); clearInterval(timer); }
      else setDisplayed(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [animate, score]);

  const color =
    displayed >= 70 ? 'from-emerald-400 to-emerald-500' :
    displayed >= 40 ? 'from-amber-400 to-orange-500' :
                      'from-red-500 to-red-600';
  const textColor =
    displayed >= 70 ? 'text-emerald-600' :
    displayed >= 40 ? 'text-amber-600' :
                      'text-red-600';
  const label =
    displayed >= 70 ? '🟢 เอกสารดูน่าเชื่อถือ' :
    displayed >= 40 ? '🟡 มีจุดน่าสงสัย' :
                      '🔴 เอกสารน่าสงสัยสูง';

  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Authenticity</span>
        <span className={`text-2xl font-black ${textColor}`}>
          {displayed}<span className="text-sm font-semibold text-slate-400">%</span>
        </span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-75`}
          style={{ width: `${animate ? displayed : 0}%` }}
        />
      </div>
      <p className="text-xs font-semibold text-right">{label}</p>
    </div>
  );
}

function DocCheckRow({ check, visible }) {
  if (!visible) return null;
  const icon =
    check.status === 'pass'    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> :
    check.status === 'fail'    ? <XCircle      className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /> :
                                 <AlertCircle  className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />;
  const textColor =
    check.status === 'pass' ? 'text-slate-700' :
    check.status === 'fail' ? 'text-red-700' : 'text-amber-700';

  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-slate-50 last:border-0 animate-fade-in">
      {icon}
      <div className="min-w-0">
        <p className={`text-xs font-semibold leading-tight ${textColor}`}>{check.name}</p>
        {check.detail && <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{check.detail}</p>}
      </div>
    </div>
  );
}

/* Mock document preview — แสดงรูปเอกสารพร้อม "วงแดง" จุดที่ผิด */
function DocPreview({ anomalyZones = [], visible }) {
  if (!visible || anomalyZones.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
      <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1 mb-2">
        <Microscope className="w-3.5 h-3.5" /> บริเวณที่พบความผิดปกติ
      </p>
      <div className="space-y-1">
        {anomalyZones.map((zone, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">
              {i + 1}
            </span>
            <p className="text-xs text-amber-800">{zone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DocForgeCard({ scanData, onLoginSave }) {
  const [phase, setPhase] = useState('scanning');
  const [scannedSteps, setScannedSteps] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showChecks, setShowChecks] = useState([]);
  const [showAnomalies, setShowAnomalies] = useState(false);
  const [meterAnimate, setMeterAnimate] = useState(false);

  useEffect(() => {
    SCAN_STEPS.forEach(({ key, delay }) => {
      setTimeout(() => {
        setScannedSteps(prev => ({ ...prev, [key]: true }));
      }, delay);
    });

    const totalDelay = SCAN_STEPS[SCAN_STEPS.length - 1].delay + 800;
    setTimeout(() => {
      setPhase('result');
      setTimeout(() => setShowResult(true), 100);
      setTimeout(() => setMeterAnimate(true), 400);
      (scanData?.doc_checks || []).forEach((_, i) => {
        setTimeout(() => setShowChecks(prev => [...prev, i]), 600 + i * 250);
      });
      setTimeout(() => setShowAnomalies(true), 600 + (scanData?.doc_checks?.length ?? 3) * 250 + 200);
    }, totalDelay);
  }, []);

  const authScore    = scanData?.authenticity_score ?? 38;
  const docChecks    = scanData?.doc_checks ?? [];
  const anomalyZones = scanData?.anomaly_zones ?? [];
  const forgeryType  = scanData?.forgery_type;

  const failCount    = docChecks.filter(c => c.status === 'fail').length;
  const warningCount = docChecks.filter(c => c.status === 'warning').length;

  return (
    <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-white">

      {/* Header — amber/yellow ให้รู้สึก "เอกสาร + คำเตือน" */}
      <div className="bg-gradient-to-r from-amber-600 to-yellow-600 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <FileWarning className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold tracking-wide">ตรวจเอกสาร · Doc</p>
          {(scanData?.doc_type || scanData?.plate) && (
            <p className="text-yellow-100 text-[11px] mt-0.5 truncate">
              {[scanData.doc_type, scanData.plate, scanData.car_info].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-yellow-100 font-medium flex-shrink-0">
          AI Analysis
        </span>
      </div>

      <div className="p-4 space-y-4">

        {/* Phase: SCANNING */}
        {phase === 'scanning' && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
              กำลังตรวจสอบเอกสาร...
            </p>
            {SCAN_STEPS.map(({ key, label }) => {
              const done = scannedSteps[key];
              return (
                <div key={key} className="flex items-center gap-2.5 py-1">
                  {done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    : <Loader2 className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 animate-spin" />
                  }
                  <span className={`text-xs flex-1 ${done ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
                  {done && <span className="text-[11px] font-semibold text-amber-500">✓</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Phase: RESULT */}
        {phase === 'result' && showResult && (
          <>
            {/* Top finding banner */}
            {scanData?.top_finding && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                <FileWarning className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 font-medium leading-snug">{scanData.top_finding}</p>
              </div>
            )}

            {/* Authenticity Meter */}
            <AuthMeter score={authScore} animate={meterAnimate} />

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-red-50 rounded-xl px-2 py-2 text-center">
                <p className="text-[10px] text-red-400 font-medium">ไม่ผ่าน</p>
                <p className="text-lg font-black text-red-600 mt-0.5">{failCount}</p>
              </div>
              <div className="bg-amber-50 rounded-xl px-2 py-2 text-center">
                <p className="text-[10px] text-amber-500 font-medium">น่าสงสัย</p>
                <p className="text-lg font-black text-amber-600 mt-0.5">{warningCount}</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-2 py-2 text-center">
                <p className="text-[10px] text-slate-400 font-medium">จุดตรวจ</p>
                <p className="text-lg font-black text-slate-700 mt-0.5">{docChecks.length || 5}</p>
              </div>
            </div>

            {/* Forgery type badge */}
            {forgeryType && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <Fingerprint className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-700 font-semibold">
                  สงสัยว่าปลอมแปลงด้วย: <span className="font-black">{forgeryType}</span>
                </p>
              </div>
            )}

            {/* Doc Checks */}
            <div className="space-y-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">ผลตรวจแต่ละจุด</p>
              {docChecks.map((check, i) => (
                <DocCheckRow key={i} check={check} visible={showChecks.includes(i)} />
              ))}
            </div>

            {/* Anomaly zones */}
            <DocPreview anomalyZones={anomalyZones} visible={showAnomalies} />

            {/* Blurred deep result */}
            <div className="relative rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-3 py-2.5 space-y-2 select-none pointer-events-none">
                <div className="flex gap-2 items-start">
                  <div className="w-10 h-12 bg-slate-200 rounded blur-sm flex-shrink-0" />
                  <div className="flex-1 space-y-1.5 pt-1">
                    <div className="h-2.5 bg-slate-200 rounded-full w-3/4 blur-sm" />
                    <div className="h-2 bg-red-200 rounded-full w-1/2 blur-sm" />
                    <div className="h-2 bg-slate-200 rounded-full w-full blur-sm" />
                  </div>
                </div>
                <div className="h-3 bg-slate-200 rounded-full w-full blur-sm" />
              </div>
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1">
                <Lock className="w-4 h-4 text-slate-400" />
                <p className="text-[11px] text-slate-500 font-medium">รายงานเต็ม + เทียบ template กรมขนส่ง</p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={onLoginSave}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl py-3 px-4 text-sm font-bold shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Save className="w-4 h-4" />
              บันทึกผลลัพธ์นี้ → เข้าสู่ระบบ
              <ChevronRight className="w-4 h-4" />
            </button>

            <p className="text-center text-[11px] text-slate-400">
              ฟรี · บันทึกได้ทันที · เปิดดูได้ทุกเมื่อ
            </p>
          </>
        )}

      </div>
    </div>
  );
}
