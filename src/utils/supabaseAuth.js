import { supabase } from './supabase';

/* ─────────────────────────────────────────────
   Auth helpers — Low-friction OAuth (Google / Line)
   ลูกค้ากดปุ่มเดียว ไม่ต้องกรอกฟอร์ม
───────────────────────────────────────────── */

// เข้าสู่ระบบด้วย Google (กดเดียวจบ)
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) console.error('Google sign-in error:', error);
  return { data, error };
};

// เข้าสู่ระบบด้วย Line (คนไทยมีทุกคน)
export const signInWithLine = async () => {
  // Line ใช้ผ่าน custom OIDC provider ใน Supabase (provider key: 'line')
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'line',
    options: { redirectTo: window.location.origin },
  });
  if (error) console.error('Line sign-in error:', error);
  return { data, error };
};

// เข้าสู่ระบบด้วยอีเมล (ทางเลือกสำรอง — magic link ไม่ต้องตั้งรหัสผ่าน)
export const signInWithEmail = async (email) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) console.error('Email sign-in error:', error);
  return { data, error };
};

// ออกจากระบบ
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Sign-out error:', error);
  return { error };
};

// ดึง session ปัจจุบัน (ใช้ตอนเปิดแอป)
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// ฟัง auth state change (login / logout / token refresh)
export const onAuthChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
};
