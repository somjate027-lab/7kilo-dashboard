// Summary Agent — สรุปการแชทเป็น structured JSON หลังจบ session

export const summarySystemPrompt = `คุณคือ Summary Agent — หน้าที่เดียวของคุณคือสรุปการสนทนาเป็น JSON

กฎเหล็ก:
- ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น
- ถ้าข้อมูลไม่มีในการสนทนา ให้ใส่ null
- JSON ต้องถูกต้อง parse ได้ทันที

รูปแบบ JSON ที่ต้องการ:
{
  "case_id": "7K-[YYYYMMDD]-[random 3 digits]",
  "timestamp": "[ISO 8601]",
  "route": "[CLONE_DETECTOR | BOT_HUNTER | DOC_FORGE | SCRAPER | UNKNOWN]",
  "priority": "[high | medium | low]",
  "victim": {
    "car_brand": "[ยี่ห้อรถ หรือ null]",
    "car_model": "[รุ่น หรือ null]",
    "license_plate": "[ทะเบียน หรือ null]",
    "color": "[สี หรือ null]"
  },
  "incident": {
    "type": "[clone_car | bot_post | doc_forge | search | unknown]",
    "description": "[สรุปเหตุการณ์ 1-2 ประโยค]",
    "platform": "[แพลตฟอร์มที่เกี่ยวข้อง หรือ null]",
    "incident_date": "[วันที่เกิดเหตุ หรือ null]"
  },
  "evidence": {
    "has_photo": [true | false],
    "has_document": [true | false],
    "notes": "[หมายเหตุเพิ่มเติม หรือ null]"
  },
  "next_action": "[แผนการสืบขั้นต่อไป 1 ประโยค]"
}

เกณฑ์ priority:
- high: มีรูปรถชัดเจน / ทราบทะเบียน / เหตุเกิดไม่เกิน 7 วัน
- medium: มีข้อมูลบางส่วน
- low: ข้อมูลน้อย / ไม่แน่ใจประเภทคดี`;

// สร้าง case_id อัตโนมัติ
export const generateCaseId = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 900 + 100);
  return `7K-${date}-${rand}`;
};

// เรียก Groq สรุป conversation เป็น JSON
export const summarizeChat = async (messages, apiKey, model = 'llama-3.3-70b-versatile') => {
  // กรอง system-notice ออก เอาแค่ user/assistant
  const chatHistory = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => `${m.role === 'user' ? 'ลูกค้า' : '7กิโล๊ะ'}: ${m.content}`)
    .join('\n');

  const userPrompt = `สรุปการสนทนานี้เป็น JSON:\n\n${chatHistory}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        { role: 'system', content: summarySystemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';

  // parse JSON — ลบ markdown code block ถ้ามี
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const summary = JSON.parse(cleaned);
    summary.case_id = generateCaseId();
    summary.timestamp = new Date().toISOString();
    return { success: true, data: summary };
  } catch {
    return { success: false, raw, error: 'JSON parse failed' };
  }
};

// บันทึกลง localStorage (Phase 1)
export const saveToLocal = (summary) => {
  const key = 'sevenKilo_cases';
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.unshift(summary); // ใหม่ขึ้นก่อน
  localStorage.setItem(key, JSON.stringify(existing));
  return existing.length;
};

// ดึง cases ทั้งหมดจาก localStorage
export const getLocalCases = () => {
  return JSON.parse(localStorage.getItem('sevenKilo_cases') || '[]');
};
