import React, { useState } from 'react';
import { Rocket, ChevronRight, X } from 'lucide-react';

/* ─────────────────────────────────────────────
   Beta Banner — สื่อสารว่า "ทดลองฟรี ผลเป็นตัวอย่าง"
   กันเข้าใจผิดว่าเป็นระบบจริงเต็มตัว + เก็บ lead
───────────────────────────────────────────── */

export default function BetaBanner({ onRegister, compact = false }) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div className="relative flex items-center gap-3 rounded-2xl border border-[#f9597b]/30 sm:border-[#f9597b]/20 bg-[#f9597b]/10 sm:bg-[#fff1f5] px-3.5 py-2.5">
      <div className="w-8 h-8 rounded-xl bg-[#f9597b]/20 flex items-center justify-center flex-shrink-0">
        <Rocket className="w-4 h-4 text-[#f9597b]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-white sm:text-slate-800">
          เปิดให้ทดลองใช้ฟรี · Beta
        </p>
        {!compact && (
          <p className="text-[11px] text-[#a8a8a8] sm:text-slate-500 leading-tight mt-0.5">
            ผลที่แสดงเป็นตัวอย่าง — ระบบจริงกำลังพัฒนา ลงทะเบียนรับสิทธิ์ใช้ก่อนใคร
          </p>
        )}
      </div>
      {onRegister && (
        <button
          onClick={onRegister}
          className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold text-white bg-gradient-to-r from-[#f9597b] to-[#c9468f] rounded-full px-3 py-1.5 active:scale-95 transition"
        >
          รับสิทธิ์ <ChevronRight className="w-3 h-3" />
        </button>
      )}
      <button onClick={() => setClosed(true)} aria-label="ปิด" className="flex-shrink-0 text-[#888] sm:text-slate-400 hover:text-white sm:hover:text-slate-600">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
