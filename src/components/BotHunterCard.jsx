import React, { useState, useEffect } from 'react';
import {
  Bot, CheckCircle2, Circle, Loader2, AlertTriangle,
  Lock, Save, ChevronRight, ShieldOff, UserX,
  Clock, Hash, TrendingDown, Eye,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Bot Hunter Scan Card
   วิเคราะห์ความน่าเชื่อถือของผู้ขาย/บัญชี
   Hook: Trust Score (ยิ่งต่ำยิ่งน่าสงสัย)
───────────────────────────────────────────── */

const CHECK_STEPS = [
  { key: 'account',   label: 'ตรวจอายุบัญชีผู้ขาย',       delay: 0    },
  { key: 'posts',     label: 'วิเคราะห์ pattern การโพสต์',  delay: 800  },
  { key: 'price',     label: 'เทียบราคากับตลาด',            delay: 1500 },
  { key: 'image',     label: 'ตรวจรูปซ้ำ / reverse image',  delay: 2200 },
  { key: 'behavior',  label: 'วิเคราะห์พฤติกรรมผู้ขาย',    delay: 3000 },
];

function TrustMeter({ score, animate }) {
  const [displayed, setDisplayed] = useState(100);

  useEffect(() => {
    if (!animate) return;
    let current = 100;
    const target = score;
    const step = (100 - target) / 40;
    const timer = setInterval(() => {
      current -= step;
      if (current <= target) { setDisplayed(target); clearInterval(timer); }
      else setDisplayed(Math.ceil(current));
    }, 30);
    return () => clearInterval(timer);
  }, [animate, score]);

  const color =
    displayed <= 30 ? 'from-red-500 to-red-600' :
    displayed <= 60 ? 'from-amber-400 to-orange-500' :
                      'from-emerald-400 to-emerald-500';
  const textColor =
    displayed <= 30 ? 'text-red-600' :
    displayed <= 60 ? 'text-amber-600' :
                      'text-emerald-600';
  const label =
    displayed <= 30 ? '🔴 น่าสงสัยมาก' :
    displayed <= 60 ? '🟡 ควรระวัง' :
                      '🟢 ดูน่าเชื่อถือ';

  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Trust Score</span>
        <span className={`text-2xl font-black ${textColor}`}>
          {displayed}<span className="text-sm font-semibold text-slate-400">/100</span>
        </span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-75`}
          style={{ width: `${animate ? displayed : 100}%` }}
        />
      </div>
      <p className="text-xs font-semibold text-right">{label}</p>
    </div>
  );
}

function SignalRow({ signal, visible }) {
  if (!visible) return null;
  const dot =
    signal.level === 'red'    ? '🔴' :
    signal.level === 'yellow' ? '🟡' : '🟢';
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-slate-50 last:border-0 animate-fade-in">
      <span className="text-base mt-0.5 flex-shrink-0">{dot}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-700 leading-tight">{signal.label}</p>
        {signal.detail && <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{signal.detail}</p>}
      </div>
    </div>
  );
}

export default function BotHunterCard({ scanData, onLoginSave }) {
  const [phase, setPhase] = useState('scanning');
  const [checkedSteps, setCheckedSteps] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showSignals, setShowSignals] = useState([]);
  const [meterAnimate, setMeterAnimate] = useState(false);

  useEffect(() => {
    CHECK_STEPS.forEach(({ key, delay }) => {
      setTimeout(() => {
        setCheckedSteps(prev => ({ ...prev, [key]: true }));
      }, delay);
    });

    const totalDelay = CHECK_STEPS[CHECK_STEPS.length - 1].delay + 800;
    setTimeout(() => {
      setPhase('result');
      setTimeout(() => setShowResult(true), 100);
      setTimeout(() => setMeterAnimate(true), 400);
      (scanData?.signals || []).forEach((_, i) => {
        setTimeout(() => setShowSignals(prev => [...prev, i]), 600 + i * 250);
      });
    }, totalDelay);
  }, []);

  const trustScore = scanData?.trust_score ?? 28;
  const botPatterns = scanData?.bot_patterns ?? [];

  return (
    <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-white">

      {/* Header — สีส้ม/แดง ให้รู้สึกอันตราย */}
      <div className="bg-gradient-to-r from-orange-600 to-red-700 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold tracking-wide">วิเคราะห์ผู้ขาย · Bot Hunter</p>
          {(scanData?.seller_name || scanData?.platform) && (
            <p className="text-orange-200 text-[11px] mt-0.5 truncate">
              {[scanData.seller_name, scanData.platform, scanData.car_info].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-orange-100 font-medium flex-shrink-0">
          AI Analysis
        </span>
      </div>

      <div className="p-4 space-y-4">

        {/* Phase: SCANNING */}
        {phase === 'scanning' && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
              กำลังตรวจสอบผู้ขาย...
            </p>
            {CHECK_STEPS.map(({ key, label }) => {
              const done = checkedSteps[key];
              return (
                <div key={key} className="flex items-center gap-2.5 py-1">
                  {done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    : <Circle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 animate-pulse" />
                  }
                  <span className={`text-xs flex-1 ${done ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
                  {done && (
                    <span className="text-[11px] font-semibold text-orange-500">✓</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Phase: RESULT */}
        {phase === 'result' && showResult && (
          <>
            {/* Warning banner */}
            {scanData?.top_warning && (
              <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
                <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-orange-800 font-medium leading-snug">{scanData.top_warning}</p>
              </div>
            )}

            {/* Trust Meter */}
            <TrustMeter score={trustScore} animate={meterAnimate} />

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
                <p className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> อายุบัญชี
                </p>
                <p className="text-sm font-black text-slate-800 mt-0.5">
                  {scanData?.account_age_days != null
                    ? scanData.account_age_days < 1
                      ? 'ใหม่มาก'
                      : `${scanData.account_age_days} วัน`
                    : 'ไม่ทราบ'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
                <p className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                  <Hash className="w-3 h-3" /> โพสต์ขายรถ
                </p>
                <p className="text-sm font-black text-slate-800 mt-0.5">
                  {scanData?.post_count_estimate != null ? `${scanData.post_count_estimate} รายการ` : 'ไม่ทราบ'}
                </p>
              </div>
            </div>

            {/* Bot patterns */}
            {botPatterns.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 space-y-1">
                <p className="text-[11px] font-bold text-red-600 uppercase tracking-wide flex items-center gap-1">
                  <UserX className="w-3.5 h-3.5" /> พบ Bot Pattern
                </p>
                {botPatterns.map((p, i) => (
                  <p key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                    <span className="mt-0.5 flex-shrink-0">▸</span>{p}
                  </p>
                ))}
              </div>
            )}

            {/* Signals */}
            <div className="space-y-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">สัญญาณที่ตรวจพบ</p>
              {(scanData?.signals || []).map((signal, i) => (
                <SignalRow key={i} signal={signal} visible={showSignals.includes(i)} />
              ))}
            </div>

            {/* Blurred deep result */}
            <div className="relative rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-3 py-2.5 space-y-2 select-none pointer-events-none">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-200 rounded-full blur-sm flex-shrink-0" />
                  <div className="space-y-1 flex-1">
                    <div className="h-2.5 bg-slate-200 rounded-full w-2/3 blur-sm" />
                    <div className="h-2 bg-slate-200 rounded-full w-1/2 blur-sm" />
                  </div>
                </div>
                <div className="h-3 bg-slate-200 rounded-full w-full blur-sm" />
                <div className="h-3 bg-slate-200 rounded-full w-3/4 blur-sm" />
              </div>
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1">
                <Lock className="w-4 h-4 text-slate-400" />
                <p className="text-[11px] text-slate-500 font-medium">ประวัติบัญชี + ลิงก์โพสต์ทั้งหมด</p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={onLoginSave}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl py-3 px-4 text-sm font-bold shadow-lg shadow-orange-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
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
