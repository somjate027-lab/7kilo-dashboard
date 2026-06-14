import React, { useState } from 'react';
import { signInWithGoogle, signInWithEmail } from '../utils/supabaseAuth';
import { MASCOT_DATA_URL } from '../constants/mascot';

export default function LoginModal({ onClose, pendingAgent }) {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    const { error } = await signInWithGoogle();
    if (error) {
      setError('เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองใหม่');
      setLoading(false);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    const { error } = await signInWithEmail(email.trim());
    setLoading(false);
    if (error) {
      setError('ส่งลิงก์ไม่สำเร็จ กรุณาลองใหม่');
    } else {
      setEmailSent(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="bg-[#141414] sm:bg-white border border-[#2a2a2a] sm:border-transparent rounded-2xl shadow-2xl w-full max-w-sm p-7 sm:p-8 relative animate-fade-in">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#666] sm:text-gray-400 hover:text-white sm:hover:text-gray-600 transition-colors"
          aria-label="ปิด"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Mascot + Title */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-3">
            <div className="absolute inset-0 rounded-full bg-[#f9597b]/25 blur-2xl scale-125 animate-pulse sm:hidden" />
            <img src={MASCOT_DATA_URL} alt="7กิโล๊ะ" className="relative w-full h-full object-contain drop-shadow-[0_0_16px_rgba(249,89,123,0.45)] sm:drop-shadow-none" />
          </div>
          <h2 className="text-xl font-bold text-white sm:text-gray-900">เข้าสู่ระบบ</h2>
          {pendingAgent && (
            <p className="text-sm text-[#a8a8a8] sm:text-gray-500 mt-1">
              บันทึกข้อมูลและเปิด Agent {pendingAgent}
            </p>
          )}
        </div>

        {emailSent ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/15 sm:bg-green-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-emerald-400 sm:text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-white sm:text-gray-800">ตรวจสอบอีเมลของคุณ</p>
            <p className="text-sm text-[#a8a8a8] sm:text-gray-500 mt-1">ส่งลิงก์เข้าระบบไปยัง <strong className="text-white sm:text-gray-700">{email}</strong> แล้ว</p>
            <p className="text-xs text-[#666] sm:text-gray-400 mt-2">คลิกลิงก์ในอีเมลเพื่อเข้าสู่ระบบ (ไม่ต้องตั้งรหัสผ่าน)</p>
            <button
              onClick={() => { setEmailSent(false); setEmail(''); }}
              className="mt-4 text-sm text-[#f9597b] hover:underline"
            >
              ใช้อีเมลอื่น
            </button>
          </div>
        ) : (
          <>
            {/* Email (PRIMARY) */}
            <form onSubmit={handleEmail} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="อีเมลของคุณ"
                required
                className="w-full bg-[#0a0a0a] sm:bg-white border border-[#2a2a2a] sm:border-gray-200 text-white sm:text-gray-900 placeholder-[#666] sm:placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f9597b]/40 sm:focus:ring-blue-400 focus:border-[#f9597b] sm:focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full bg-gradient-to-r from-[#f9597b] to-[#c9468f] sm:from-blue-600 sm:to-cyan-500 hover:from-[#e0486a] hover:to-[#b03d7e] sm:hover:from-blue-700 sm:hover:to-cyan-600 text-white rounded-xl px-4 py-3 font-semibold text-sm transition-all duration-200 shadow-[0_4px_14px_rgba(249,89,123,0.35)] sm:shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'กำลังส่ง...' : 'เข้าระบบผ่านอีเมล'}
              </button>
            </form>

            {/* Divider — desktop only */}
            <div className="hidden sm:flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">หรือ</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google (SECONDARY) — desktop only */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="hidden sm:flex w-full items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'ใช้บัญชี Google'}
            </button>

            {error && (
              <p className="mt-3 text-center text-sm text-rose-400 sm:text-red-500">{error}</p>
            )}

            <p className="mt-4 text-center text-xs text-[#666] sm:text-gray-400">
              ไม่ต้องตั้งรหัสผ่าน · ข้อมูลปลอดภัย · ยกเลิกได้ทุกเวลา
            </p>
          </>
        )}
      </div>
    </div>
  );
}
