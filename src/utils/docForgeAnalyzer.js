/* ─────────────────────────────────────────────
   Doc Forge Analyzer
   รับบทสนทนา → Groq วิเคราะห์ความน่าเชื่อถือของเอกสาร
───────────────────────────────────────────── */

const ANALYZER_PROMPT = `คุณเป็นผู้เชี่ยวชาญตรวจจับเอกสารรถปลอมและเอกสาร AI-generated ในประเทศไทย

จากบทสนทนา จงวิเคราะห์และตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น

โครงสร้าง JSON:
{
  "doc_type": "ประเภทเอกสาร เช่น 'เล่มทะเบียน' หรือ 'ใบเสร็จซื้อขาย' หรือ 'หนังสือมอบอำนาจ' หรือ null",
  "plate": "ทะเบียนที่เกี่ยวข้อง หรือ null",
  "car_info": "ข้อมูลรถสั้นๆ หรือ null",
  "authenticity_score": คะแนนความน่าเชื่อถือของเอกสาร 0-100,
  "forgery_type": "ประเภทการปลอมแปลงที่สงสัย เช่น 'Photoshop' หรือ 'AI-generated' หรือ 'ถ่ายเอกสาร' หรือ null",
  "doc_checks": [
    { "name": "ชื่อจุดตรวจ", "status": "pass" หรือ "fail" หรือ "warning", "detail": "รายละเอียด" }
  ],
  "signals": [
    { "level": "red" หรือ "yellow" หรือ "green", "label": "ชื่อสัญญาณ", "detail": "รายละเอียด" }
  ],
  "anomaly_zones": [
    "บริเวณที่พบความผิดปกติ เช่น 'ช่องเลขตัวถัง VIN' หรือ 'ตราประทับกรมขนส่ง'"
  ],
  "top_finding": "ผลการตรวจที่สำคัญที่สุด (1 ประโยค ภาษาไทย)",
  "summary_th": "สรุปสั้นๆ 1 ประโยค ภาษาไทย"
}

กฎการให้ authenticity_score (เริ่มที่ 100 แล้วหัก):
- ฟอนต์ไม่ตรง template กรมขนส่ง: -30
- ตราประทับเบลอหรือผิดรูปแบบ: -25
- เลขตัวถัง VIN ผิดรูปแบบ/ไม่ตรง: -30
- watermark ไม่ครบหรือผิดตำแหน่ง: -20
- พบ pixel artifact รอบตัวอักษร (sign of editing): -25
- กระดาษไม่มี security feature: -15
- รูปแบบเอกสารไม่ตรง template ปัจจุบัน: -20
- เลขที่เอกสารซ้ำกับรายการอื่นในฐานข้อมูล: -35

หากข้อมูลน้อย ให้ประมาณจาก pattern ที่มีและให้ doc_checks ที่สมเหตุสมผลสำหรับเอกสารรถในไทย`;

export async function analyzeDocForge(messages) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error('No API key');

  const conversationText = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => `${m.role === 'user' ? 'ผู้เสียหาย' : 'AI'}: ${m.content}`)
    .join('\n');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: ANALYZER_PROMPT },
        { role: 'user', content: `บทสนทนา:\n${conversationText}\n\nวิเคราะห์และตอบเป็น JSON เท่านั้น` },
      ],
      temperature: 0.3,
      max_tokens: 800,
    }),
  });

  if (!response.ok) throw new Error('Analyzer API error');
  const data = await response.json();
  const raw = data.choices[0]?.message?.content || '{}';
  const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonStr);
}
