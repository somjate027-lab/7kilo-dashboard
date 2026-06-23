import React from 'react';
import { LOGO_DATA_URL } from '../constants/logo';
import { MASCOT_DATA_URL } from '../constants/mascot';
import {
  ScanSearch,
  Bot,
  FileWarning,
  Globe2,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Zap,
  Search,
} from 'lucide-react';

const agentCards = [
  {
    key: 'CLONE_DETECTOR',
    icon: ScanSearch,
    emoji: '🔍',
    name: 'Clone Detector',
    nameTh: 'ตรวจจับรถโคลน',
    desc: 'วิเคราะห์ว่ารูปรถถูกนำไปขายที่อื่นหรือไม่ ด้วย reverse image search และ EXIF metadata',
    tags: ['Reverse Image Search', 'EXIF Analysis', 'Duplicate Plate'],
    gradient: 'from-violet-500 to-indigo-600',
    lightBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    tagBg: 'bg-violet-100 text-violet-700',
    borderHover: 'hover:border-violet-300',
    glowColor: 'hover:shadow-violet-100',
  },
  {
    key: 'BOT_HUNTER',
    icon: Bot,
    emoji: '🤖',
    name: 'Bot Hunter',
    nameTh: 'ล่าบัญชีปลอม',
    desc: 'ตรวจสอบโพสต์ขายรถและบัญชีผู้ขายว่าเป็น Bot มิจฉาชีพ หรือรถที่ขโมยมา',
    tags: ['Account Analysis', 'Price Anomaly', 'Post Pattern'],
    gradient: 'from-rose-500 to-orange-500',
    lightBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    tagBg: 'bg-rose-100 text-rose-700',
    borderHover: 'hover:border-rose-300',
    glowColor: 'hover:shadow-rose-100',
  },
  {
    key: 'DOC_FORGE',
    icon: FileWarning,
    emoji: '📄',
    name: 'Doc',
    nameTh: 'ตรวจเอกสารปลอม',
    desc: 'วิเคราะห์ความถูกต้องของเล่มทะเบียน ใบเสร็จ และเอกสารที่อาจสร้างด้วย AI',
    tags: ['AI Document Detect', 'Watermark Check', 'VIN Verify'],
    gradient: 'from-amber-500 to-yellow-500',
    lightBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    tagBg: 'bg-amber-100 text-amber-700',
    borderHover: 'hover:border-amber-300',
    glowColor: 'hover:shadow-amber-100',
  },
  {
    key: 'SCRAPER',
    icon: Globe2,
    emoji: '🌐',
    name: 'Scraper',
    nameTh: 'กวาดหาข้อมูล',
    desc: 'ค้นหาข้อมูลรถจาก Kaidee, One2Car, Facebook พร้อมสร้าง search query ที่แม่นยำ',
    tags: ['Multi-Platform', 'Search Query', 'Network Scan'],
    gradient: 'from-teal-500 to-cyan-500',
    lightBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    tagBg: 'bg-teal-100 text-teal-700',
    borderHover: 'hover:border-teal-300',
    glowColor: 'hover:shadow-teal-100',
  },
];

const stats = [
  { icon: ShieldCheck, label: 'คดีที่แก้ไขได้', value: '4 ประเภท' },
  { icon: Zap,         label: 'ตอบสนอง',        value: '< 3 วินาที' },
  { icon: Search,      label: 'แพลตฟอร์ม',      value: '5+ แห่ง' },
];

export default function LandingPage({ setActiveTab }) {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto px-5 py-8 space-y-10">

        {/* ─── Hero ─── */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img
            src={MASCOT_DATA_URL}
            alt="7กิโล๊ะ"
            className="w-16 h-16 rounded-2xl object-contain flex-shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">7กิโล๊ะ</h1>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
              สืบรถโคลน · รถหาย — เลือกเครื่องมือ หรือแชทกับ <strong className="text-slate-700">7กิโล๊ะ</strong> ได้เลย
            </p>
            <div className="flex items-center gap-4 mt-3">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{value} {label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Section title ─── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">เลือก Agent ที่ตรงกับปัญหา</h2>
            <button
              onClick={() => setActiveTab('แชท')}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors cursor-pointer"
            >
              แชทกับ 7กิโล๊ะ โดยตรง
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ─── Agent Cards Grid ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {agentCards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.key}
                  onClick={() => setActiveTab(card.key)}
                  className={`group text-left bg-white border border-slate-200 ${card.borderHover} rounded-2xl p-5 shadow-sm hover:shadow-md ${card.glowColor} transition-all duration-300 cursor-pointer`}
                >
                  {/* Card top row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.lightBg} flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${card.iconColor}`} />
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-200 ${card.tagBg} opacity-0 group-hover:opacity-100`}>
                      เริ่มใช้งาน <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-bold text-slate-900 text-sm">{card.name}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">{card.nameTh}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {card.tags.map((tag) => (
                      <span key={tag} className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${card.tagBg}`}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Bottom gradient bar */}
                  <div className={`mt-4 h-0.5 rounded-full bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Center Chat CTA ─── */}
        <div
          onClick={() => setActiveTab('แชท')}
          className="flex items-center gap-4 bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-sm hover:shadow-md hover:shadow-indigo-50 transition-all duration-300 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <div class="bg-slate-200 rounded w-12 h-12 flex items-center justify-center text-xs">image</div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-sm">ไม่แน่ใจ? แชทกับ 7กิโล๊ะ โดยตรง</p>
            <p className="text-xs text-slate-400 mt-0.5">บอกปัญหาได้เลย — ระบบจะวิเคราะห์และพาไปหา Agent ที่ใช่ให้อัตโนมัติ</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
        </div>

        {/* ─── Footer note ─── */}
        <p className="text-center text-xs text-slate-300 pb-4">
          7กิโล๊ะ ให้คำแนะนำเท่านั้น — การดำเนินคดีทางกฎหมายต้องผ่านเจ้าหน้าที่ตำรวจ
        </p>
      </div>
    </div>
  );
}
