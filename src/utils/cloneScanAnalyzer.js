import { groqFetch } from './groqProxy';

/* ─────────────────────────────────────────────
   Clone Scan Analyzer
   รับบทสนทนาจาก Center → Groq วิเคราะห์ → คืน JSON ความเสี่ยง
   ข้อมูลมาจาก AI วิเคราะห์ input จริง ไม่ใช่สุ่ม
───────────────────────────────────────────── */

const ANALYZER_PROMPT = `คุณเป็นผู้เชี่ยวชาญวิเคราะห์ความเสี่ยงรถโคลนในประเทศไทย

จากบทสนทนา จงวิเคราะห์และตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น

โครงสร้าง JSON ที่ต้องการ:
{
  "plate": "เลขทะเบียนที่พบในบทสนทนา หรือ null",
  "brand": "ยี่ห้อรถ หรือ null",
  "model": "รุ่นรถ หรือ null",
  "color": "สีรถ หรือ null",
  "price_mentioned": ราคาที่บอก (ตัวเลข) หรือ null,
  "market_price_estimate": ราคาตลาดโดยประมาณ (ตัวเลข) หรือ null,
  "risk_score": คะแนนความเสี่ยง 0-100 (วิเคราะห์จาก pattern ที่เล่า),
  "risk_level": "low" หรือ "medium" หรือ "high",
  "signals": [
    { "level": "red" หรือ "yellow" หรือ "green", "label": "ชื่อสัญญาณ", "detail": "รายละเอียดสั้น" }
  ],
  "platform_estimates": {
    "kaidee": จำนวนประกาศที่คาดว่าจะพบ (0-5),
    "one2car": จำนวน (0-3),
    "facebook": จำนวน (0-4),
    "tarad": จำนวน (0-2),
    "pantip": จำนวน (0-2)
  },
  "top_risk_reason": "เหตุผลหลักที่เสี่ยงที่สุด (1 ประโยค ภาษาไทย)",
  "summary_th": "สรุปคดีสั้นๆ 1 ประโยค ภาษาไทย"
}

กฎการให้คะแนน risk_score:
- ราคาต่ำกว่าตลาด >30%: +25 คะแนน
- ยี่ห้อ/รุ่นที่โดนโคลนบ่อย (Honda Civic, Toyota Fortuner, Isuzu D-Max, Ford Ranger, Toyota Hilux): +20
- พบประกาศซ้ำหลายที่: +25
- บัญชีผู้ขายใหม่: +15
- ไม่ยอมให้ตรวจ VIN: +20
- ปฏิเสธนัดพบ: +15
- รูปน้อยหรือรูปไม่ชัด: +10

หากข้อมูลน้อย ให้ประมาณจาก pattern ที่มี และให้ signals ที่สมเหตุสมผล
platform_estimates ให้ประมาณตามความน่าจะเป็น ไม่ใช่ข้อมูลจริง — เพื่อแสดงขอบเขตการค้นหา`;

export async function analyzeCloneRisk(messages) {
  // สรุปบทสนทนาสำหรับ analyzer
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
    temperature: 0.3, // ต่ำ = ผลสม่ำเสมอ ไม่สุ่มมาก
    max_tokens: 800,
  });

  if (!response.ok) throw new Error('Analyzer API error');

  const data = await response.json();
  const raw = data.choices[0]?.message?.content || '{}';

  // parse JSON — strip markdown code blocks ถ้ามี
  const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonStr);
}
