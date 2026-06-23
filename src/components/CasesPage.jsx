import React, { useState, useEffect } from 'react';
import {
  Folder, Plus, RefreshCw, Trash2, ChevronRight,
  Clock, CheckCircle2, XCircle, AlertCircle,
  ScanSearch, Bot, FileWarning, Globe2,
  Car, Calendar, Tag, MoreHorizontal,
  Search, Filter, Loader2,
} from 'lucide-react';
import { fetchUserCases, updateCaseStatus, deleteCase } from '../utils/casesApi';

/* ─────────────────────────────────────────────
   หน้า "คดีที่บันทึก"
   แสดงรายการคดีทั้งหมดของ user จาก Supabase
───────────────────────────────────────────── */

const AGENT_META = {
  CLONE_DETECTOR: { label: 'Clone Detector', icon: ScanSearch, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', dot: 'bg-violet-400' },
  BOT_HUNTER:     { label: 'Bot Hunter',     icon: Bot,        color: 'text-rose-600',   bg: 'bg-rose-50',   border: 'border-rose-100',   dot: 'bg-rose-400' },
  DOC_FORGE:      { label: 'Doc',      icon: FileWarning,color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100',  dot: 'bg-amber-400' },
  SCRAPER:        { label: 'Scraper',        icon: Globe2,     color: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-100',   dot: 'bg-teal-400' },
};

const STATUS_META = {
  open:        { label: 'กำลังสืบ',  icon: Clock,         cls: 'bg-blue-50 text-blue-600 border-blue-100' },
  in_progress: { label: 'ดำเนินการ', icon: AlertCircle,   cls: 'bg-amber-50 text-amber-600 border-amber-100' },
  resolved:    { label: 'สำเร็จ',    icon: CheckCircle2,  cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  closed:      { label: 'ปิดคดี',    icon: XCircle,       cls: 'bg-slate-50 text-slate-500 border-slate-200' },
};

const PRIORITY_META = {
  high:   { label: 'สูง',    cls: 'bg-red-100 text-red-600' },
  medium: { label: 'กลาง',   cls: 'bg-amber-100 text-amber-600' },
  low:    { label: 'ต่ำ',    cls: 'bg-slate-100 text-slate-500' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'เมื่อกี้';
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชม.ที่แล้ว`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} วันที่แล้ว`;
  return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

function StatusBadge({ status }) {
  const s = STATUS_META[status] ?? STATUS_META.open;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>
      <Icon className="w-3 h-3" />
      {s.label}
    </span>
  );
}

function CaseCard({ case: c, onStatusChange, onDelete }) {
  const agent  = AGENT_META[c.route] ?? AGENT_META.CLONE_DETECTOR;
  const AgentIcon = agent.icon;
  const priority = PRIORITY_META[c.priority] ?? PRIORITY_META.medium;
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(c.id);
  };

  return (
    <div className={`bg-white rounded-2xl border ${agent.border} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group`}>
      {/* Top color strip */}
      <div className={`h-1 w-full ${agent.dot}`} />

      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl ${agent.bg} flex items-center justify-center flex-shrink-0`}>
              <AgentIcon className={`w-4 h-4 ${agent.color}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-[11px] font-bold ${agent.color} uppercase tracking-wide`}>{agent.label}</p>
              <p className="text-sm font-bold text-slate-800 truncate mt-0.5">
                {[c.plate, c.car_brand, c.car_model].filter(Boolean).join(' · ') || 'ไม่ระบุข้อมูลรถ'}
              </p>
            </div>
          </div>

          {/* More menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 w-40 bg-white border border-slate-100 rounded-xl shadow-lg z-20 py-1 text-xs">
                {Object.entries(STATUS_META).map(([key, val]) => (
                  c.status !== key && (
                    <button
                      key={key}
                      onClick={() => { onStatusChange(c.id, key); setMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-600"
                    >
                      เปลี่ยนเป็น "{val.label}"
                    </button>
                  )
                ))}
                <hr className="my-1 border-slate-100" />
                <button
                  onClick={() => { handleDelete(); setMenuOpen(false); }}
                  disabled={deleting}
                  className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-500 flex items-center gap-1.5"
                >
                  {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  ลบคดีนี้
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {c.description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{c.description}</p>
        )}

        {/* Tags row */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={c.status} />
          {c.priority && (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${priority.cls}`}>
              {priority.label}
            </span>
          )}
          {c.color && (
            <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
              {c.color}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-50">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {timeAgo(c.created_at)}
          </span>
          <button className={`text-[11px] font-semibold ${agent.color} flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity`}>
            ดูรายละเอียด <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onNewCase }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Folder className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-base font-bold text-slate-700 mb-1">ยังไม่มีคดีที่บันทึก</h3>
      <p className="text-sm text-slate-400 mb-5 max-w-xs">
        เริ่มสืบคดีใหม่ แล้วกด "บันทึก" เพื่อเก็บผลการสแกนไว้ที่นี่
      </p>
      <button
        onClick={onNewCase}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
      >
        <Plus className="w-4 h-4" />
        สืบรถใหม่
      </button>
    </div>
  );
}

export default function CasesPage({ user, setActiveTab }) {
  const [cases, setCases]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRoute, setFilterRoute]   = useState('all');

  const load = async () => {
    setLoading(true);
    const data = await fetchUserCases();
    setCases(data);
    setLoading(false);
  };

  useEffect(() => { if (user) load(); else setLoading(false); }, [user]);

  const handleStatusChange = async (id, status) => {
    const ok = await updateCaseStatus(id, status);
    if (ok) setCases(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleDelete = async (id) => {
    const ok = await deleteCase(id);
    if (ok) setCases(prev => prev.filter(c => c.id !== id));
  };

  // Filter + Search
  const filtered = cases.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterRoute  !== 'all' && c.route  !== filterRoute)  return false;
    if (search) {
      const q = search.toLowerCase();
      return [c.plate, c.car_brand, c.car_model, c.description]
        .some(v => v?.toLowerCase().includes(q));
    }
    return true;
  });

  const counts = {
    all:         cases.length,
    open:        cases.filter(c => c.status === 'open').length,
    in_progress: cases.filter(c => c.status === 'in_progress').length,
    resolved:    cases.filter(c => c.status === 'resolved').length,
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20 text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
          <Folder className="w-7 h-7 text-blue-500" />
        </div>
        <h3 className="text-base font-bold text-slate-700 mb-1">เข้าสู่ระบบก่อนนะครับ</h3>
        <p className="text-sm text-slate-400">เพื่อดูรายการคดีที่บันทึกไว้</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Folder className="w-5 h-5 text-indigo-500" />
              คดีที่บันทึก
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">ทั้งหมด {cases.length} คดี</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="รีเฟรช"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setActiveTab?.('แชท')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              สืบคดีใหม่
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-5 space-y-5">

          {/* Search + Filter bar */}
          {cases.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ค้นหา ทะเบียน ยี่ห้อ รุ่น..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-600"
              >
                <option value="all">สถานะทั้งหมด ({counts.all})</option>
                <option value="open">กำลังสืบ ({counts.open})</option>
                <option value="in_progress">ดำเนินการ ({counts.in_progress})</option>
                <option value="resolved">สำเร็จ ({counts.resolved})</option>
              </select>

              {/* Agent filter */}
              <select
                value={filterRoute}
                onChange={e => setFilterRoute(e.target.value)}
                className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-600"
              >
                <option value="all">Agent ทั้งหมด</option>
                {Object.entries(AGENT_META).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Status tabs */}
          {cases.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: `ทั้งหมด ${counts.all}` },
                { key: 'open', label: `กำลังสืบ ${counts.open}` },
                { key: 'in_progress', label: `ดำเนินการ ${counts.in_progress}` },
                { key: 'resolved', label: `สำเร็จ ${counts.resolved}` },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    filterStatus === tab.key
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            cases.length === 0
              ? <EmptyState onNewCase={() => setActiveTab?.('แชท')} />
              : (
                <div className="text-center py-16">
                  <p className="text-slate-400 text-sm">ไม่พบคดีที่ตรงเงื่อนไข</p>
                  <button onClick={() => { setSearch(''); setFilterStatus('all'); setFilterRoute('all'); }}
                    className="mt-2 text-sm text-indigo-500 hover:underline">ล้าง filter</button>
                </div>
              )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(c => (
                <CaseCard
                  key={c.id}
                  case={c}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
