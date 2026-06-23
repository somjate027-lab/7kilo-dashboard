import { groqFetch } from './groqProxy';

/* ─────────────────────────────────────────────
   Bot Hunter Analyzer
   รับบทสนทนา → Groq วิเคราะห์ความน่าเชื่อถือของผู้ขาย
───────────────────────────────────────────── */

const ANALYZER_PROMPT = `คุณเป็นผู้เชี่ยวชาญตรวจจับบัญชีปลอมและ Bot ขายรถในประเทศไทย

จากบทสนทนา จงวิเคราะห์และตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น

โครงสร้าง JSON:
{
  "seller_name": "ชื่อผู้ขายที่พบในบทสนทนา หรือ null",
  "platform": "แพลตฟอร์มที่พบประกาศ หรือ null",
  "car_info": "ข้อมูลรถสั้นๆ หรือ null",
  "price_mentioned": ราคาที่บอก (ตัวเลข) หรือ null,
  "market_price_estimate": ราคาตลาด (ตัวเลข) หรือ null,
  "trust_score": คะแนนความน่าเชื่อถือ 0-100 (ยิ่งต่ำยิ่งน่าสงสัย),
  "account_age_days": อายุบัญชีโดยประมาณ (ตัวเลขวัน) หรือ null,
  "post_count_estimate": จำนวนโพสต์ขายรถโดยประมาณ หรือ null,
  "signals": [
    { "level": "red" หรือ "yellow" หรือ "green", "label": "ชื่อสัญญาณ", "detail": "รายละเอียดสั้น" }
  ],
  "bot_patterns": [
    "pattern ที่ตรวจพบ เช่น 'โพสต์ซ้ำหลายกลุ่ม' หรือ 'บัญชีสร้างใหม่'"
  ],
  "top_warning": "คำเตือนหลักที่สำคัญที่สุด (1 ประโยค ภาษาไทย)",
  "summary_th": "สรุปสถานการณ์สั้นๆ 1 ประโยค ภาษาไทย"
}

กฎการให้ trust_score (เริ่มที่ 100 แล้วหัก):
- บัญชีอายุน้อยกว่า 30 วัน: -35
- บัญชีอายุ 30-180 วัน: -15
- โพสต์รถมากกว่า 5 คันใน 7 วัน: -30
- ราคาต่ำกว่าตลาด 20-30%: -20
- ราคาต่ำกว่าตลาด มากกว่า 30%: -35
- ปฏิเสธให้ตรวจ VIN หรือนัดพบ: -25
- รูปน้อย (น้อยกว่า 3 รูป): -15
- รูปซ้ำกับประกาศอื่น: -25
- ไม่มีเบอร์โทรจริง: -10

หากข้อมูลน้อย ให้ประมาณจาก pattern และให้ signals ที่สมเหตุสมผลสำหรับคดีรถในไทย`;

export async function analyzeBotRisk(messages) {
  const conversationText = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => `${m.role === 'user' ? 'ผู้เสียหาย' : 'AI'}: ${m.content}`)
    .join('\n');

  const response = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: ANALYZER_PROMPT },
      { role: 'user', content: `บทสนทนา:\n${conversationText}\n\nวิเคราะห์และตอบเป็น JSON เท่านั้น` },
    ],
    temperature: 0.3,
    max_tokens: 800,
  });

  if (!response.ok) throw new Error('Analyzer API error');
  const data = await response.json();
  const raw = data.choices[0]?.message?.content || '{}';
  const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonStr);
}
