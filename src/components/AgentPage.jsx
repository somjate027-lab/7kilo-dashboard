import React, { useState, useRef, useEffect } from 'react';
import {
  Send, RotateCw, Upload, Search, AlertTriangle, CheckCircle2,
  Circle, ExternalLink, Copy, ChevronRight, Sparkles, X,
  ScanSearch, Bot, FileWarning, Globe2, ImagePlus, Link2,
  FileText, ToggleLeft, ToggleRight, Loader2, ShieldAlert,
  ShieldCheck, Hash, Car, Calendar, Palette,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────── */
const parseInlineMarkdown = (text) => {
  const parts = [];
  let remaining = text;
  const boldRegex = /\*\*([^*]+)\*\*/;
  while (remaining) {
    const match = boldRegex.exec(remaining);
    if (match) {
      if (match.index > 0) parts.push(remaining.substring(0, match.index));
      parts.push(<strong key={remaining.length + match.index} className="font-bold text-slate-900">{match[1]}</strong>);
      remaining = remaining.substring(match.index + match[0].length);
    } else { parts.push(remaining); break; }
  }
  return parts;
};

const StatusBadge = ({ status }) => {
  const map = {
    idle:    { label: 'พร้อมใช้งาน', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    running: { label: 'กำลังทำงาน', cls: 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse' },
    done:    { label: 'เสร็จสิ้น',   cls: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  };
  const s = map[status] || map.idle;
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>;
};

/* ─────────────────────────────────────────────
   LEFT WORKSPACES (1 per agent)
───────────────────────────────────────────── */

/* 1. Clone Detector */
function WorkspaceClone({ onSendToChat }) {
  const [plate, setPlate]       = useState('');
  const [brand, setBrand]       = useState('');
  const [color, setColor]       = useState('');
  const [image, setImage]       = useState(null);
  const [status, setStatus]     = useState('idle');
  const [platforms, setPlatforms] = useState({
    kaidee: true, one2car: true, facebook: true, tarad: false, pantip: false,
  });
  const fileRef = useRef(null);

  const handleScan = () => {
    if (!plate && !image) return;
    setStatus('running');
    const summary = `ต้องการ Scan รถโคลน — ทะเบียน: ${plate || 'ไม่ระบุ'} ยี่ห้อ: ${brand || 'ไม่ระบุ'} สี: ${color || 'ไม่ระบุ'}${image ? ' มีรูปรถแนบมาด้วย' : ''} แพลตฟอร์มที่เลือก: ${Object.entries(platforms).filter(([,v])=>v).map(([k])=>k).join(', ')}`;
    onSendToChat(summary);
    setTimeout(() => setStatus('done'), 800);
  };

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ScanSearch className="w-4 h-4 text-violet-600" /> Clone Detector
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">ตรวจจับรูปรถที่ถูกนำไปใช้ซ้ำหรือขายที่อื่น</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Image drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
          image ? 'border-violet-300 bg-violet-50' : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/50'
        }`}
      >
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if(f) setImage({file:f, url:URL.createObjectURL(f)}); }} />
        {image ? (
          <div className="flex items-center gap-3">
            <div class="bg-slate-200 rounded w-12 h-12 flex items-center justify-center text-xs">image</div>
            <div className="text-left">
              <p className="text-sm font-semibold text-violet-700">{image.file.name}</p>
              <p className="text-xs text-slate-400">{(image.file.size/1024).toFixed(0)} KB</p>
            </div>
            <button onClick={e=>{e.stopPropagation();setImage(null)}} className="ml-auto p-1.5 hover:bg-violet-100 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <ImagePlus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">คลิกหรือลากรูปรถมาวาง</p>
            <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP ไม่เกิน 10MB</p>
          </>
        )}
      </div>

      {/* Car info fields */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Hash,    label: 'ทะเบียน',  val: plate, set: setPlate, placeholder: 'กข 1234' },
          { icon: Car,     label: 'ยี่ห้อ',   val: brand, set: setBrand, placeholder: 'Toyota' },
          { icon: Palette, label: 'สีรถ',     val: color, set: setColor, placeholder: 'ขาว' },
        ].map(({ icon: Icon, label, val, set, placeholder }) => (
          <div key={label} className={label === 'ทะเบียน' ? 'col-span-2' : ''}>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Icon className="w-3 h-3" />{label}
            </label>
            <input value={val} onChange={e=>set(e.target.value)} placeholder={placeholder}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:bg-white transition-all" />
          </div>
        ))}
      </div>

      {/* Platform toggles */}
      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">แพลตฟอร์มที่ค้นหา</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(platforms).map(([key, active]) => (
            <button key={key} onClick={() => setPlatforms(p=>({...p,[key]:!p[key]}))}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                active ? 'bg-violet-100 text-violet-700 border-violet-200' : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
              {active ? '✓ ' : ''}{key.charAt(0).toUpperCase()+key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Scan button */}
      <button onClick={handleScan} disabled={!plate && !image}
        className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm">
        {status === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanSearch className="w-4 h-4" />}
        {status === 'running' ? 'กำลัง Scan...' : 'เริ่ม Scan รถโคลน'}
      </button>

      {/* Powered by */}
      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
        <span>Powered by <strong className="text-slate-500">OpenClawAI</strong> Reverse Image Engine</span>
      </div>
    </div>
  );
}

/* 2. Bot Hunter */
function WorkspaceBot({ onSendToChat }) {
  const [url, setUrl]       = useState('');
  const [status, setStatus] = useState('idle');
  const [score, setScore]   = useState(null);
  const flags = [
    { id: 'new_account',   label: 'บัญชีสร้างใหม่ < 6 เดือน' },
    { id: 'cheap_price',   label: 'ราคาต่ำกว่าตลาด > 20%' },
    { id: 'duplicate_post',label: 'โพสต์ซ้ำหลายกลุ่ม' },
    { id: 'no_meet',       label: 'ปฏิเสธนัดพบหรือตรวจสอบ' },
    { id: 'vin_missing',   label: 'ไม่มี / ขูดลบเลขตัวถัง' },
  ];
  const [checked, setChecked] = useState({});

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const riskLevel = checkedCount >= 4 ? 'high' : checkedCount >= 2 ? 'medium' : 'low';
  const riskConfig = {
    high:   { label: 'ความเสี่ยงสูงมาก', cls: 'text-rose-600 bg-rose-50 border-rose-200', bar: 'bg-rose-500', width: '90%' },
    medium: { label: 'ความเสี่ยงปานกลาง', cls: 'text-amber-600 bg-amber-50 border-amber-200', bar: 'bg-amber-400', width: '50%' },
    low:    { label: 'ความเสี่ยงต่ำ',    cls: 'text-emerald-600 bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500', width: '15%' },
  };

  const handleAnalyze = () => {
    if (!url && checkedCount === 0) return;
    setStatus('running');
    const flagList = flags.filter(f=>checked[f.id]).map(f=>f.label).join(', ');
    const msg = `วิเคราะห์บัญชี/โพสต์สงสัย — URL: ${url || 'ไม่ระบุ'} พบสัญญาณอันตราย: ${flagList || 'ยังไม่ระบุ'}`;
    onSendToChat(msg);
    setTimeout(() => { setScore(checkedCount); setStatus('done'); }, 800);
  };

  const rc = riskConfig[riskLevel];

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-4 h-4 text-rose-600" /> Bot Hunter
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">วิเคราะห์บัญชีและโพสต์ขายรถน่าสงสัย</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* URL input */}
      <div>
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
          <Link2 className="w-3 h-3" />URL โพสต์ / ชื่อบัญชี
        </label>
        <div className="flex gap-2">
          <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="facebook.com/... หรือ kaidee.com/..."
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-400 focus:bg-white transition-all" />
          {url && <button onClick={()=>window.open(url,'_blank')} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors cursor-pointer"><ExternalLink className="w-4 h-4"/></button>}
        </div>
      </div>

      {/* Risk flags checklist */}
      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">สัญญาณอันตราย (เลือกที่พบ)</p>
        <div className="space-y-2">
          {flags.map(f => (
            <label key={f.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
              <div onClick={()=>setChecked(c=>({...c,[f.id]:!c[f.id]}))}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  checked[f.id] ? 'bg-rose-500 border-rose-500' : 'border-slate-300 group-hover:border-rose-300'
                }`}>
                {checked[f.id] && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={`text-sm ${checked[f.id] ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Risk meter */}
      {checkedCount > 0 && (
        <div className={`p-3 rounded-xl border ${rc.cls}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold">{rc.label}</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
            <div className={`h-2 rounded-full transition-all duration-500 ${rc.bar}`} style={{width: rc.width}} />
          </div>
          <p className="text-xs mt-1.5 opacity-75">พบ {checkedCount} จาก 5 สัญญาณ</p>
        </div>
      )}

      <button onClick={handleAnalyze} disabled={!url && checkedCount===0}
        className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm">
        {status==='running' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Bot className="w-4 h-4"/>}
        {status==='running' ? 'กำลังวิเคราะห์...' : 'วิเคราะห์บัญชีนี้'}
      </button>

      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-rose-400" />
        <span>Powered by <strong className="text-slate-500">HermesAgent</strong> Social Intelligence</span>
      </div>
    </div>
  );
}

/* 3. Doc Forge */
function WorkspaceDoc({ onSendToChat }) {
  const [status, setStatus] = useState('idle');
  const [docImage, setDocImage] = useState(null);
  const docFileRef = useRef(null);
  const checks = [
    { id: 'watermark', label: 'ตรวจ Watermark และลายน้ำ' },
    { id: 'font',      label: 'ความสม่ำเสมอของฟอนต์และ spacing' },
    { id: 'layout',    label: 'Layout ตรงกับมาตรฐานกรมขนส่ง' },
    { id: 'pixel',     label: 'Pixel artifact รอบตัวอักษร (Photoshop)' },
    { id: 'ai',        label: 'AI-Generated document detection' },
    { id: 'vin',       label: 'ตรวจ VIN ตรงกับทะเบียน' },
  ];
  const [checklist, setChecklist] = useState({});
  const doneCount = Object.values(checklist).filter(Boolean).length;

  const handleVerify = () => {
    if (!docImage && doneCount === 0) return;
    setStatus('running');
    const doneItems = checks.filter(c=>checklist[c.id]).map(c=>c.label).join(', ');
    const msg = `ตรวจสอบเอกสารรถ${docImage ? ' มีรูปเอกสารแนบ' : ''} รายการที่ตรวจแล้ว: ${doneItems || 'ยังไม่ระบุ'}`;
    onSendToChat(msg);
    setTimeout(() => setStatus('done'), 800);
  };

  const progressPct = Math.round((doneCount / checks.length) * 100);

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-amber-600" /> Doc Forge
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">ตรวจจับเอกสารรถปลอมและ AI Generated</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Document upload */}
      <div onClick={()=>docFileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-300 ${
          docImage ? 'border-amber-300 bg-amber-50' : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
        }`}>
        <input ref={docFileRef} type="file" accept="image/*,.pdf" className="hidden"
          onChange={e=>{const f=e.target.files?.[0];if(f)setDocImage({file:f,url:URL.createObjectURL(f)});}} />
        {docImage ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-amber-700">{docImage.file.name}</p>
              <p className="text-xs text-slate-400">{(docImage.file.size/1024).toFixed(0)} KB</p>
            </div>
            <button onClick={e=>{e.stopPropagation();setDocImage(null)}} className="ml-auto p-1.5 hover:bg-amber-100 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
              <X className="w-4 h-4"/>
            </button>
          </div>
        ) : (
          <>
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">อัปโหลดรูปเอกสาร / PDF</p>
            <p className="text-xs text-slate-400 mt-1">เล่มทะเบียน, ใบเสร็จ, หนังสือมอบอำนาจ</p>
          </>
        )}
      </div>

      {/* Verification checklist */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Checklist การตรวจสอบ</p>
          <span className="text-xs text-slate-400">{doneCount}/{checks.length}</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full mb-3 overflow-hidden">
          <div className="h-1.5 bg-amber-400 rounded-full transition-all duration-500" style={{width:`${progressPct}%`}} />
        </div>
        <div className="space-y-1.5">
          {checks.map(c => (
            <label key={c.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
              <div onClick={()=>setChecklist(cl=>({...cl,[c.id]:!cl[c.id]}))}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  checklist[c.id] ? 'bg-amber-500 border-amber-500' : 'border-slate-300 group-hover:border-amber-300'
                }`}>
                {checklist[c.id] && <CheckCircle2 className="w-3.5 h-3.5 text-white"/>}
              </div>
              <span className={`text-sm ${checklist[c.id] ? 'text-slate-800 font-medium line-through opacity-60' : 'text-slate-500'}`}>{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button onClick={handleVerify} disabled={!docImage && doneCount===0}
        className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm">
        {status==='running' ? <Loader2 className="w-4 h-4 animate-spin"/> : <ShieldCheck className="w-4 h-4"/>}
        {status==='running' ? 'กำลังตรวจสอบ...' : 'ตรวจสอบเอกสาร'}
      </button>

      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Powered by <strong className="text-slate-500">HermesAgent</strong> Doc AI</span>
      </div>
    </div>
  );
}

/* 4. Scraper */
function WorkspaceScraper({ onSendToChat }) {
  const [plate, setPlate]   = useState('');
  const [brand, setBrand]   = useState('');
  const [model, setModel]   = useState('');
  const [color, setColor]   = useState('');
  const [status, setStatus] = useState('idle');
  const [generatedQueries, setGeneratedQueries] = useState([]);
  const platforms = [
    { key: 'kaidee',    label: 'Kaidee',       active: true,  cls: 'bg-orange-50 text-orange-600 border-orange-200' },
    { key: 'one2car',   label: 'One2Car',      active: true,  cls: 'bg-blue-50 text-blue-600 border-blue-200' },
    { key: 'facebook',  label: 'Facebook',     active: true,  cls: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    { key: 'pantip',    label: 'Pantip',       active: false, cls: 'bg-purple-50 text-purple-600 border-purple-200' },
    { key: 'transport', label: 'กรมขนส่ง',    active: false, cls: 'bg-teal-50 text-teal-600 border-teal-200' },
  ];
  const [activePlatforms, setActivePlatforms] = useState(
    Object.fromEntries(platforms.map(p=>[p.key, p.active]))
  );

  const handleGenerate = () => {
    if (!plate && !brand) return;
    setStatus('running');
    const queries = [];
    if (plate && brand) queries.push(`"${brand}" "${plate}" site:kaidee.com`);
    if (plate) queries.push(`"${plate}" ${brand||''} ${model||''}`.trim() + ' -site:official');
    if (brand && model) queries.push(`${brand} ${model} ${color||''} ขายรถ`.trim());
    if (plate) queries.push(`ทะเบียน "${plate}" รถหาย OR โจร`);
    setGeneratedQueries(queries);
    const msg = `ขอ Search Plan สำหรับ — ทะเบียน: ${plate||'ไม่ระบุ'} ยี่ห้อ: ${brand||'ไม่ระบุ'} รุ่น: ${model||'ไม่ระบุ'} สี: ${color||'ไม่ระบุ'} แพลตฟอร์ม: ${Object.entries(activePlatforms).filter(([,v])=>v).map(([k])=>k).join(', ')}`;
    onSendToChat(msg);
    setTimeout(() => setStatus('done'), 800);
  };

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-teal-600" /> Scraper
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">กวาดหาข้อมูลรถจากหลายแพลตฟอร์ม</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Car info */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label:'ทะเบียน', val:plate, set:setPlate, placeholder:'กข 1234', span:2 },
          { label:'ยี่ห้อ',  val:brand, set:setBrand, placeholder:'Honda' },
          { label:'รุ่น',    val:model, set:setModel, placeholder:'Jazz' },
          { label:'สีรถ',    val:color, set:setColor, placeholder:'เทา', span:2 },
        ].map(({label,val,set,placeholder,span}) => (
          <div key={label} className={span===2 ? 'col-span-2' : ''}>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 block">{label}</label>
            <input value={val} onChange={e=>set(e.target.value)} placeholder={placeholder}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:bg-white transition-all" />
          </div>
        ))}
      </div>

      {/* Platform selector */}
      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">เลือกแพลตฟอร์ม</p>
        <div className="flex flex-wrap gap-2">
          {platforms.map(p => (
            <button key={p.key} onClick={()=>setActivePlatforms(ap=>({...ap,[p.key]:!ap[p.key]}))}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                activePlatforms[p.key] ? p.cls : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
              {activePlatforms[p.key]?'✓ ':''}{p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generated queries */}
      {generatedQueries.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Search Queries ที่สร้าง</p>
          {generatedQueries.map((q,i) => (
            <div key={i} className="flex items-center gap-2 bg-white border border-slate-100 rounded-lg px-3 py-2">
              <code className="text-xs text-teal-700 flex-1 break-all">{q}</code>
              <button onClick={()=>navigator.clipboard?.writeText(q)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-teal-600 transition-colors cursor-pointer flex-shrink-0">
                <Copy className="w-3.5 h-3.5"/>
              </button>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleGenerate} disabled={!plate && !brand}
        className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm">
        {status==='running' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4"/>}
        {status==='running' ? 'กำลังสร้าง Plan...' : 'สร้าง Search Plan'}
      </button>

      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
        <span>Powered by <strong className="text-slate-500">HermesAgent</strong> Network Crawler</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   RIGHT CHAT PANEL
───────────────────────────────────────────── */
function ChatPanel({ config, externalInput, onExternalInputConsumed, initialMessages = [] }) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  // Seed ด้วย handoff messages จาก Center (ถ้ามี) + welcome notice
  const buildInitialMessages = () => {
    if (!initialMessages || initialMessages.length === 0) return [];
    return [
      {
        id: 'handoff-notice',
        role: 'system-notice',
        content: `📋 สรุปบทสนทนาจาก Chat Center — ${config.label || config.key} รับเรื่องต่อแล้ว`,
        timestamp: new Date(),
      },
      ...initialMessages.map((m, i) => ({ ...m, id: `handoff-${i}` })),
    ];
  };

  const [messages, setMessages] = useState(buildInitialMessages);
  const [input, setInput]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const abortRef       = useRef(null);
  const textareaRef    = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // รับ input จาก workspace
  useEffect(() => {
    if (externalInput) {
      handleSend(externalInput);
      onExternalInputConsumed();
    }
  }, [externalInput]);

  const handleSend = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text || isLoading) return;
    if (!textOverride) setInput('');

    const userMsg = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setIsLoading(true);

    const aid = Date.now();
    setMessages(prev => [...prev, { id: aid, role: 'assistant', content: '', streaming: true }]);

    try {
      const controller = new AbortController();
      abortRef.current = controller;
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          stream: true,
          messages: [
            { role: 'system', content: config.systemPrompt },
            ...updated.map(m => ({ role: m.role, content: m.content }))
          ]
        })
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split('\n')) {
          if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
          try { const tok = JSON.parse(line.slice(6))?.choices?.[0]?.delta?.content||''; full+=tok; setMessages(p=>p.map(m=>m.id===aid?{...m,content:full}:m)); } catch{}
        }
      }
      setMessages(p=>p.map(m=>m.id===aid?{...m,streaming:false}:m));
    } catch(e) {
      if (e.name!=='AbortError') setMessages(p=>p.map(m=>m.id===aid?{...m,content:'เกิดข้อผิดพลาด กรุณาลองใหม่',streaming:false}:m));
    } finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border-l border-slate-100">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div class="bg-slate-200 rounded w-12 h-12 flex items-center justify-center text-xs">image</div>
          <div>
            <p className="text-xs font-bold text-slate-800">{config.name}</p>
            <p className="text-[11px] text-slate-400">{config.tagline}</p>
          </div>
        </div>
        <button onClick={()=>{abortRef.current?.abort();setMessages([]);setIsLoading(false);}}
          className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all cursor-pointer" title="รีเซ็ต">
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 pb-10">
            <span className="text-3xl">{config.icon}</span>
            <p className="text-sm font-medium text-slate-600">{config.name} พร้อมช่วยเหลือ</p>
            <p className="text-xs text-slate-400 max-w-[200px]">{config.emptyState}</p>
          </div>
        ) : messages.map((msg, i) => {
          // system-notice: handoff banner หรือ dispatch notice
          if (msg.role === 'system-notice') return (
            <div key={i} className="flex justify-center">
              <span className="text-[11px] text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-3 py-1 text-center leading-relaxed">
                {parseInlineMarkdown(msg.content)}
              </span>
            </div>
          );
          return (
            <div key={i} className={`flex ${msg.role==='user'?'justify-end':'items-start gap-2'}`}>
              {msg.role==='assistant' && <div class="bg-slate-200 rounded w-12 h-12 flex items-center justify-center text-xs">image</div>}
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
                msg.role==='user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
              }`}>
                {msg.content.split('\n').map((line,li)=>(
                  <p key={li} className={li>0?'mt-1':''}>{parseInlineMarkdown(line)}</p>
                ))}
                {msg.streaming && <span className="inline-block w-1 h-3 bg-indigo-400 rounded animate-pulse ml-0.5"/>}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 flex-shrink-0">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex items-end gap-1.5 p-1.5">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={e=>{ setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,100)+'px'; }}
            onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSend();} }}
            placeholder={config.inputPlaceholder}
            className="flex-1 resize-none outline-none text-xs text-slate-700 placeholder-slate-400 px-1.5 py-1 bg-transparent leading-relaxed"
            style={{minHeight:'30px',maxHeight:'100px'}}
          />
          <button onClick={()=>handleSend()} disabled={!input.trim()||isLoading}
            className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer disabled:cursor-not-allowed">
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN AgentPage (Hostinger layout)
   Desktop: Left workspace | Right chat (340px)
   Mobile:  Tab switcher top — Workspace / Chat
───────────────────────────────────────────── */
export default function AgentPage({ config, user, initialMessages = [] }) {
  const [externalChatInput, setExternalChatInput] = useState(null);
  const [mobileTab, setMobileTab] = useState('workspace'); // 'workspace' | 'chat'

  const workspaceMap = {
    CLONE_DETECTOR: WorkspaceClone,
    BOT_HUNTER:     WorkspaceBot,
    DOC_FORGE:      WorkspaceDoc,
    SCRAPER:        WorkspaceScraper,
  };

  const Workspace = workspaceMap[config.key] || WorkspaceClone;

  const handleSendToChat = (msg) => {
    setExternalChatInput(msg);
    setMobileTab('chat'); // auto-switch to chat tab on mobile after action
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* ── Mobile Tab Bar (hidden on md+) ── */}
      <div className="flex md:hidden border-b border-slate-100 bg-white flex-shrink-0">
        {[
          { key: 'workspace', label: '🛠 เครื่องมือ' },
          { key: 'chat',      label: `${config.icon} แชท AI` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setMobileTab(tab.key)}
            className={`flex-1 py-2.5 text-sm font-semibold transition-all cursor-pointer border-b-2 ${
              mobileTab === tab.key
                ? 'text-indigo-600 border-indigo-500 bg-indigo-50/40'
                : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content Area ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: Tool Workspace
            Desktop → always visible (flex-1)
            Mobile  → visible only when mobileTab==='workspace' */}
        <div className={`flex-1 overflow-hidden bg-white border-r border-slate-100 ${
          mobileTab === 'chat' ? 'hidden md:flex md:flex-col' : 'flex flex-col'
        }`}>
          <Workspace onSendToChat={handleSendToChat} />
        </div>

        {/* RIGHT: Chat Panel
            Desktop → fixed 340px, always visible
            Mobile  → full-width, visible only when mobileTab==='chat' */}
        <div className={`flex-shrink-0 flex flex-col overflow-hidden ${
          mobileTab === 'workspace'
            ? 'hidden md:flex md:w-[340px]'
            : 'flex w-full md:w-[340px]'
        }`}>
          <ChatPanel
            config={config}
            externalInput={externalChatInput}
            onExternalInputConsumed={() => setExternalChatInput(null)}
            initialMessages={initialMessages}
          />
        </div>

      </div>
    </div>
  );
}
