import React, { useState, useEffect } from 'react';
import {
  Globe2, CheckCircle2, Circle, Loader2,
  Lock, Save, ChevronRight, MapPin, Clock,
  Flame, Target, Radio, Wifi,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Scraper Scan Card
   ตามหารถข้ามแพลตฟอร์ม
   Hook: "พบ X เบาะแส" + แสดง lead ล่าสุดแบบ live feed
───────────────────────────────────────────── */

const SCAN_PLATFORMS = [
  { key: 'kaidee',   label: 'Kaidee.com',          delay: 0    },
  { key: 'one2car',  label: 'One2Car.com',          delay: 600  },
  { key: 'facebook', label: 'Facebook Marketplace', delay: 1300 },
  { key: 'pantip',   label: 'Pantip ซื้อขาย',       delay: 2000 },
  { key: 'tarad',    label: 'ตลาดรถ.com',           delay: 2600 },
  { key: 'transport',label: 'กรมขนส่ง (ทะเบียน)',   delay: 3200 },
];

function MatchBar({ score, animate }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setW(score), 100);
    return () => clearTimeout(t);
  }, [animate, score]);

  const color = score >= 75 ? 'bg-red-500' : score >= 50 ? 'bg-amber-400' : 'bg-slate-300';
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-16">
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${w}%` }} />
    </div>
  );
}

function LeadCard({ lead, index, visible, animate }) {
  if (!visible) return null;
  const isHot = lead.match_score >= 75;
  return (
    <div className={`flex items-start gap-2.5 p-2.5 rounded-xl border animate-fade-in ${
      isHot ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
    }`}>
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isHot ? 'bg-red-100' : 'bg-slate-100'
      }`}>
        {isHot
          ? <Flame className="w-3.5 h-3.5 text-red-500" />
          : <Target className="w-3.5 h-3.5 text-slate-400" />
        }
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[11px] font-bold ${isHot ? 'text-red-700' : 'text-slate-600'}`}>
            {lead.platform}
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-0.5 flex-shrink-0">
            <Clock className="w-2.5 h-2.5" />
            {lead.hours_ago < 1 ? 'เพิ่งโพสต์' : `${lead.hours_ago} ชม.`}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
          <span className="text-[11px] text-slate-500 truncate">{lead.location}</span>
        </div>
        {lead.detail && (
          <p className="text-[11px] text-slate-600 leading-tight">{lead.detail}</p>
        )}
        <MatchBar score={lead.match_score} animate={animate} />
      </div>
      <div className={`text-xs font-black flex-shrink-0 ${
        lead.match_score >= 75 ? 'text-red-600' :
        lead.match_score >= 50 ? 'text-amber-600' : 'text-slate-400'
      }`}>
        {lead.match_score}%
      </div>
    </div>
  );
}

/* Live counter — นับขึ้นเรื่อยๆ ให้รู้สึกว่า scan กำลังทำงาน */
function LiveCounter({ target, active }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active || count >= target) return;
    const t = setInterval(() => {
      setCount(prev => {
        if (prev >= target) { clearInterval(t); return target; }
        return prev + 1;
      });
    }, 200);
    return () => clearInterval(t);
  }, [active, target]);
  return <span>{count}</span>;
}

export default function ScraperCard({ scanData, onLoginSave }) {
  const [phase, setPhase]             = useState('scanning');
  const [scannedPlats, setScannedPlats] = useState({});
  const [foundCounts, setFoundCounts]   = useState({});
  const [showResult, setShowResult]     = useState(false);
  const [showLeads, setShowLeads]       = useState([]);
  const [showSignals, setShowSignals]   = useState([]);
  const [barsAnimate, setBarsAnimate]   = useState(false);

  const totalLeads   = scanData?.total_leads ?? 6;
  const hotLeads     = scanData?.hot_lead_count ?? 2;
  const leads        = scanData?.leads ?? [];
  const platforms    = scanData?.platforms_hit ?? [];

  useEffect(() => {
    SCAN_PLATFORMS.forEach(({ key, delay }) => {
      setTimeout(() => {
        setScannedPlats(prev => ({ ...prev, [key]: true }));
        // ค่อยๆ reveal จำนวนที่พบ
        const plat = platforms.find(p => p.name?.toLowerCase().includes(key)) ?? null;
        const cnt  = plat?.count ?? (key === 'transport' ? 0 : Math.floor(Math.random() * 3));
        setFoundCounts(prev => ({ ...prev, [key]: cnt }));
      }, delay);
    });

    const totalDelay = SCAN_PLATFORMS[SCAN_PLATFORMS.length - 1].delay + 900;
    setTimeout(() => {
      setPhase('result');
      setTimeout(() => setShowResult(true), 100);
      setTimeout(() => setBarsAnimate(true), 500);
      leads.forEach((_, i) => {
        setTimeout(() => setShowLeads(prev => [...prev, i]), 700 + i * 350);
      });
      (scanData?.signals ?? []).forEach((_, i) => {
        setTimeout(() => setShowSignals(prev => [...prev, i]), 700 + leads.length * 350 + i * 200);
      });
    }, totalDelay);
  }, []);

  return (
    <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-white">

      {/* Header — teal/green ให้รู้สึก "ตามหา / GPS" */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-700 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <Radio className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold tracking-wide">ตามหารถ · Scraper</p>
          {scanData?.car_info && (
            <p className="text-teal-200 text-[11px] mt-0.5 truncate">
              {[scanData.car_info, scanData.plate, scanData.last_seen && `พบล่าสุด: ${scanData.last_seen}`]
                .filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-teal-100 font-medium flex-shrink-0">
          AI Analysis
        </span>
      </div>

      <div className="p-4 space-y-4">

        {/* Phase: SCANNING */}
        {phase === 'scanning' && (
          <div className="space-y-2">
            {/* Live counter ตรงกลาง */}
            <div className="flex items-center justify-center py-2">
              <div className="text-center">
                <p className="text-4xl font-black text-teal-600 tabular-nums">
                  <LiveCounter target={totalLeads} active={true} />
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">เบาะแสที่พบ</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-500" />
              กำลังกวาดหาข้ามแพลตฟอร์ม...
            </p>
            {SCAN_PLATFORMS.map(({ key, label }) => {
              const done = scannedPlats[key];
              const cnt  = foundCounts[key];
              return (
                <div key={key} className="flex items-center gap-2.5 py-0.5">
                  {done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    : <Circle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 animate-pulse" />
                  }
                  <span className={`text-xs flex-1 ${done ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
                  {done && cnt != null && (
                    <span className={`text-[11px] font-bold ${cnt > 0 ? 'text-teal-600' : 'text-slate-400'}`}>
                      {cnt > 0 ? `${cnt} เบาะแส` : '–'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Phase: RESULT */}
        {phase === 'result' && showResult && (
          <>
            {/* Hottest lead banner */}
            {scanData?.hottest_lead && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <Flame className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-800 font-medium leading-snug">{scanData.hottest_lead}</p>
              </div>
            )}

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-teal-50 rounded-xl px-2 py-2.5 text-center">
                <p className="text-[10px] text-teal-500 font-medium">เบาะแสทั้งหมด</p>
                <p className="text-xl font-black text-teal-700 mt-0.5">{totalLeads}</p>
              </div>
              <div className="bg-red-50 rounded-xl px-2 py-2.5 text-center">
                <p className="text-[10px] text-red-400 font-medium flex items-center justify-center gap-0.5">
                  <Flame className="w-2.5 h-2.5" /> ร้อนแรง
                </p>
                <p className="text-xl font-black text-red-600 mt-0.5">{hotLeads}</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-2 py-2.5 text-center">
                <p className="text-[10px] text-slate-400 font-medium">รัศมี</p>
                <p className="text-xl font-black text-slate-700 mt-0.5">
                  {scanData?.search_radius_km ?? 150}
                  <span className="text-[10px] font-medium"> km</span>
                </p>
              </div>
            </div>

            {/* Live leads feed */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <Wifi className="w-3 h-3 text-teal-500" /> เบาะแสล่าสุด
              </p>
              {leads.map((lead, i) => (
                <LeadCard
                  key={i}
                  lead={lead}
                  index={i}
                  visible={showLeads.includes(i)}
                  animate={barsAnimate}
                />
              ))}
            </div>

            {/* Signals */}
            {(scanData?.signals ?? []).length > 0 && (
              <div className="space-y-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">สัญญาณอื่น</p>
                {(scanData.signals).map((sig, i) => (
                  showSignals.includes(i) && (
                    <div key={i} className="flex items-start gap-2 py-1.5 border-b border-slate-50 last:border-0">
                      <span className="text-base mt-0.5 flex-shrink-0">
                        {sig.level === 'red' ? '🔴' : sig.level === 'yellow' ? '🟡' : '🟢'}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-700 leading-tight">{sig.label}</p>
                        {sig.detail && <p className="text-[11px] text-slate-400 mt-0.5">{sig.detail}</p>}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}

            {/* Blurred deep result */}
            <div className="relative rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-3 py-3 space-y-2 select-none pointer-events-none">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-200 rounded-full blur-sm flex-shrink-0" />
                    <div className="flex-1 h-3 bg-slate-200 rounded-full blur-sm" />
                    <div className="w-10 h-3 bg-slate-200 rounded-full blur-sm flex-shrink-0" />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1">
                <Lock className="w-4 h-4 text-slate-400" />
                <p className="text-[11px] text-slate-500 font-medium">พิกัด + ลิงก์ประกาศทั้งหมด</p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={onLoginSave}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl py-3 px-4 text-sm font-bold shadow-lg shadow-teal-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Save className="w-4 h-4" />
              บันทึกเบาะแสทั้งหมด → เข้าสู่ระบบ
              <ChevronRight className="w-4 h-4" />
            </button>

            <p className="text-center text-[11px] text-slate-400">
              ฟรี · บันทึกได้ทันที · แจ้งเตือนเมื่อพบเบาะแสใหม่
            </p>
          </>
        )}

      </div>
    </div>
  );
}
