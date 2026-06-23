import React, { useState, useEffect } from 'react';
import {
  Bot, CheckCircle2, Circle, Loader2, AlertTriangle,
  Lock, Save, ChevronRight, TrendingDown, Flame,
  Layers, Megaphone,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Bot Hunter Scan Card — Rush Sale Detector
   Demo-first: ลูกค้ากดปุ่ม → เห็นเคสตัวอย่างจริง
   วิเคราะห์ 4 ปัจจัย: ราคา / คำเร่งด่วน / โพสต์ซ้ำ / ยิงแอด
───────────────────────────────────────────── */

// เคสตัวอย่าง (Camry รีบขาย) — ลูกค้าไม่ต้องกรอกเอง
const DEMO = {
  post: 'ด่วน!!! Camry 2018 Top สุด รีบขายวันนี้เท่านั้น หลุดจำนำ ร้อนเงินมาก ต้องปิดจ๊อบด่วน ทักแชทด่วนครับ',
  car: 'Toyota Camry 2018',
  price: 470000,
  market: 680000,
  factors: [
    { key: 'price', icon: TrendingDown, label: 'ราคาต่ำกว่าตลาด 31%', detail: 'เสนอ ฿470,000 · ตลาด ฿680,000', score: 36, delay: 0 },
    { key: 'urgency', icon: Flame, label: 'ภาษาเร่งด่วน 5 คำ', detail: 'ด่วน · รีบขาย · หลุดจำนำ · ร้อนเงิน · ปิดจ๊อบ', score: 28, delay: 250 },
    { key: 'groups', icon: Layers, label: 'โพสต์ซ้ำ 4 กลุ่ม', detail: 'ภายใน 3 ชม. (rush sale pattern)', score: 18, delay: 500 },
    { key: 'ads', icon: Megaphone, label: 'ยิงแอดหนัก', detail: 'งบ ฿1,200 — สูงผิดปกติสำหรับรถบ้าน', score: 10, delay: 750 },
  ],
  timeline: [
    { g: 'รถมือสองถูกและดี', t: '13:10' },
    { g: 'ขายรถบ้าน',        t: '14:05' },
    { g: 'Camry Club',       t: '14:48' },
    { g: 'รถหลุดจำนำ',       t: '15:32' },
  ],
};

const SCAN_STEPS = [
  { key: 'price',   label: 'เทียบราคากับตลาด',          delay: 0    },
  { key: 'text',    label: 'สแกนภาษาเร่งด่วนในโพสต์',   delay: 700  },
  { key: 'groups',  label: 'ตรวจการโพสต์ซ้ำข้ามกลุ่ม',  delay: 1400 },
  { key: 'ads',     label: 'วิเคราะห์การยิงโฆษณา',       delay: 2100 },
];

// เกจครึ่งวงกลม SVG — animate 0 → score
function RiskGauge({ score, animate }) {
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

  const LEN = 219.9; // ความยาวเส้นโค้งครึ่งวงกลม r=70
  const offset = LEN * (1 - displayed / 100);
  const color =
    displayed >= 70 ? '#ef4444' :
    displayed >= 40 ? '#f59e0b' : '#22c55e';
  const label =
    displayed >= 70 ? '🔴 เสี่ยงสูง — เข้าข่ายรถถูกขโมย' :
    displayed >= 40 ? '🟡 น่าสงสัย — ควรตรวจเพิ่ม' :
                      '🟢 ความเสี่ยงต่ำ';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[160px] h-[88px]">
        <svg viewBox="0 0 160 95" className="w-full h-full">
          <path d="M10 80 A70 70 0 0 1 150 80" fill="none"
            stroke="#2a2a2a" className="sm:stroke-slate-100" strokeWidth="12" strokeLinecap="round" />
          <path d="M10 80 A70 70 0 0 1 150 80" fill="none"
            stroke={color} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={LEN} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset .075s linear' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-3xl font-black" style={{ color }}>{displayed}</span>
          <span className="text-[10px] text-[#666] sm:text-slate-400 -mt-1">/ 100</span>
        </div>
      </div>
      <p className="text-xs font-semibold mt-1">{label}</p>
    </div>
  );
}

function FactorRow({ factor, visible }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setW(factor.score), 60);
    return () => clearTimeout(t);
  }, [visible, factor.score]);
  if (!visible) return null;

  const Icon = factor.icon;
  const barColor = factor.score >= 25 ? 'bg-red-500' : factor.score >= 15 ? 'bg-amber-500' : 'bg-[#f9597b]';
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#e0e0e0] sm:text-slate-700 flex items-center gap-1.5 min-w-0">
          <Icon className="w-3.5 h-3.5 text-[#f9597b] flex-shrink-0" />
          <span className="truncate">{factor.label}</span>
        </span>
        <span className="text-xs font-black text-red-400 sm:text-red-500 flex-shrink-0">+{factor.score}</span>
      </div>
      <p className="text-[11px] text-[#777] sm:text-slate-400 mt-0.5 leading-tight pl-5">{factor.detail}</p>
      <div className="h-1.5 bg-[#2a2a2a] sm:bg-slate-100 rounded-full overflow-hidden mt-1.5 ml-5">
        <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

export default function BotHunterCard({ scanData, onLoginSave }) {
  const [phase, setPhase] = useState('scanning');
  const [checked, setChecked] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showFactors, setShowFactors] = useState([]);
  const [gaugeAnimate, setGaugeAnimate] = useState(false);

  const totalScore = Math.min(100, DEMO.factors.reduce((a, f) => a + f.score, 0));

  useEffect(() => {
    SCAN_STEPS.forEach(({ key, delay }) => {
      setTimeout(() => setChecked(prev => ({ ...prev, [key]: true })), delay);
    });
    const total = SCAN_STEPS[SCAN_STEPS.length - 1].delay + 800;
    setTimeout(() => {
      setPhase('result');
      setTimeout(() => setShowResult(true), 100);
      DEMO.factors.forEach((f, i) => {
        setTimeout(() => setShowFactors(prev => [...prev, i]), 300 + f.delay);
      });
      setTimeout(() => setGaugeAnimate(true), 300 + 1000);
    }, total);
  }, []);

  return (
    <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-[#2a2a2a] sm:border-slate-200 shadow-lg bg-[#141414] sm:bg-white">

      {/* Header */}
      <div className="bg-[#1a1a1a] sm:bg-gradient-to-r sm:from-slate-900 sm:to-slate-800 border-b border-[#2a2a2a] sm:border-b-0 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#f9597b]/15 sm:bg-white/10 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-[#f9597b] sm:text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold tracking-wide">ผลสแกนเบื้องต้น · Bot Hunter</p>
          <p className="text-[#8a8a8a] sm:text-slate-400 text-[11px] mt-0.5 truncate">{DEMO.car} · โพสต์รีบขาย</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[#c2c2c2] sm:text-slate-300 font-medium flex-shrink-0">
          ตัวอย่างเคส
        </span>
      </div>

      <div className="p-4 space-y-4">

        {/* Quoted post */}
        <div className="flex items-start gap-2 bg-red-500/10 sm:bg-red-50 border border-red-500/30 sm:border-red-100 rounded-xl px-3 py-2">
          <Flame className="w-4 h-4 text-red-400 sm:text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-300 sm:text-red-700 font-medium leading-snug">"{DEMO.post}"</p>
        </div>

        {/* Phase: SCANNING */}
        {phase === 'scanning' && (
          <div className="space-y-2">
            <p className="text-xs text-[#a8a8a8] sm:text-slate-500 font-medium flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#f9597b] sm:text-indigo-500" />
              กำลังวิเคราะห์พฤติกรรมการขาย...
            </p>
            {SCAN_STEPS.map(({ key, label }) => {
              const done = checked[key];
              return (
                <div key={key} className="flex items-center gap-2.5 py-1">
                  {done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    : <Circle className="w-3.5 h-3.5 text-[#444] sm:text-slate-300 flex-shrink-0 animate-pulse" />}
                  <span className={`text-xs flex-1 ${done ? 'text-[#e0e0e0] sm:text-slate-700' : 'text-[#666] sm:text-slate-400'}`}>{label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Phase: RESULT */}
        {phase === 'result' && showResult && (
          <>
            {/* Factors */}
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-[#777] sm:text-slate-400 uppercase tracking-wide">ปัจจัยความเสี่ยง</p>
              {DEMO.factors.map((f, i) => (
                <FactorRow key={f.key} factor={f} visible={showFactors.includes(i)} />
              ))}
            </div>

            {/* Gauge */}
            <div className="pt-2 border-t border-[#222] sm:border-slate-100">
              <RiskGauge score={totalScore} animate={gaugeAnimate} />
            </div>

            {/* Timeline */}
            <div className="bg-[#1a1a1a] sm:bg-slate-50 rounded-xl px-3 py-2.5">
              <p className="text-[11px] font-bold text-[#777] sm:text-slate-400 uppercase tracking-wide mb-2">
                ⏱ ไทม์ไลน์โพสต์ข้ามกลุ่ม · 4 กลุ่มใน 2.5 ชม.
              </p>
              <div className="flex items-center justify-between gap-1">
                {DEMO.timeline.map((it, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f9597b] flex-shrink-0" />
                    <span className="text-[9px] text-[#999] sm:text-slate-500 mt-1 text-center leading-tight truncate w-full">{it.g}</span>
                    <span className="text-[9px] text-[#666] sm:text-slate-400">{it.t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Blurred deep result */}
            <div className="relative rounded-xl border border-[#2a2a2a] sm:border-slate-100 overflow-hidden">
              <div className="px-3 py-2 space-y-2 select-none pointer-events-none">
                <div className="h-3 bg-[#2a2a2a] sm:bg-slate-200 rounded-full w-3/4 blur-sm" />
                <div className="h-3 bg-[#2a2a2a] sm:bg-slate-200 rounded-full w-full blur-sm" />
                <div className="h-3 bg-[#2a2a2a] sm:bg-slate-200 rounded-full w-2/3 blur-sm" />
              </div>
              <div className="absolute inset-0 bg-[#141414]/70 sm:bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1">
                <Lock className="w-4 h-4 text-[#8a8a8a] sm:text-slate-400" />
                <p className="text-[11px] text-[#a8a8a8] sm:text-slate-500 font-medium">ประวัติบัญชี + ลิงก์โพสต์ทั้งหมด</p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={onLoginSave}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#f9597b] to-[#c9468f] sm:from-blue-600 sm:to-cyan-500 hover:from-[#e0486a] hover:to-[#b03d7e] sm:hover:from-blue-700 sm:hover:to-cyan-600 text-white rounded-xl py-3 px-4 text-sm font-bold shadow-lg shadow-[#f9597b]/25 sm:shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Save className="w-4 h-4" />
              เช็คโพสต์ที่คุณสงสัย → เข้าสู่ระบบ
              <ChevronRight className="w-4 h-4" />
            </button>

            <p className="text-center text-[11px] text-[#666] sm:text-slate-400">
              ฟรี · วางลิงก์โพสต์ได้ทันที · บันทึกผลไว้ดูภายหลัง
            </p>
          </>
        )}

      </div>
    </div>
  );
}
