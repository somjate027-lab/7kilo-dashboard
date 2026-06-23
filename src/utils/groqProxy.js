// เรียก Groq ผ่าน Supabase Edge Function (proxy)
// key เก็บเป็น secret GROQ_API_KEY ฝั่ง server — ไม่หลุดมาที่ client/bundle
// rotate key = เปลี่ยน secret จุดเดียวใน Supabase ทุกแอปทำงานต่อทันที
export const GROQ_PROXY_URL =
  'https://qyjcfoxzqgkosvbaiyif.supabase.co/functions/v1/groq-chat';

// คืนค่าเป็น Response เหมือน fetch เดิม → โค้ดที่เรียก res.json() / res.body ใช้ต่อได้เลย
// options เผื่อส่ง signal (abort) สำหรับ streaming
export async function groqFetch(body, options = {}) {
  return fetch(GROQ_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...options,
  });
}
