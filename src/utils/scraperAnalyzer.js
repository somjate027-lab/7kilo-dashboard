import { groqFetch } from './groqProxy';

/* ─────────────────────────────────────────────
   Scraper Analyzer
   รับบทสนทนา → Groq วิเคราะห์เบาะแสรถที่ตามหา
───────────────────────────────────────────── */

const ANALYZER_PROMPT = `คุณเป็นผู้เชี่ยวชาญค้นหาและตามรอยรถหายในประเทศไทย

จากบทสนทนา จงวิเคราะห์และตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น

โครงสร้าง JSON:
{
  "car_info": "ข้อมูลรถที่ตามหา เช่น 'Honda Civic ขาว ปี 2020' หรือ null",
  "plate": "ทะเบียนที่ตามหา หรือ null",
  "last_seen": "สถานที่พบล่าสุด หรือ null",
  "total_leads": จำนวนเบาะแสที่พบโดยรวม (0-15),
  "hot_lead_count": จำนวนเบาะแสที่น่าสนใจมาก (0-5),
  "platforms_hit": [
    { "name": "ชื่อแพลตฟอร์ม", "count": จำนวนที่พบ, "latest_hours_ago": ชั่วโมงที่แล้ว หรือ null }
  ],
  "leads": [
    {
      "platform": "ชื่อแพลตฟอร์ม",
      "location": "ย่านหรือจังหวัด",
      "hours_ago": จำนวนชั่วโมงที่แล้ว,
      "match_score": คะแนนความตรงกัน 0-100,
      "detail": "รายละเอียดสั้น เช่น 'รถสีขาว ราคา 3.5 แสน'"
    }
  ],
  "signals": [
    { "level": "red" หรือ "yellow" หรือ "green", "label": "ชื่อสัญญาณ", "detail": "รายละเอียด" }
  ],
  "hottest_lead": "เบาะแสที่ร้อนแรงที่สุด (1 ประโยค ภาษาไทย) หรือ null",
  "search_radius_km": รัศมีการค้นหาโดยประมาณ (50-300),
  "summary_th": "สรุปผลการค้นหาสั้นๆ 1 ประโยค ภาษาไทย"
}

กฎการประมาณ leads:
- รถยอดนิยมที่โดนขโมยบ่อย (Honda, Toyota, Isuzu): leads 4-8
- มีทะเบียนชัดเจน: leads เพิ่ม 2-3
- บอกสี/รุ่นชัด: leads เพิ่ม 1-2
- แจ้งความแล้ว: hot_lead_count เพิ่ม 1
- platforms_hit ควรมีอย่างน้อย 3 แพลตฟอร์ม
- leads array ให้มี 2-4 รายการที่น่าสนใจ พร้อม location ในไทย
- match_score: เบาะแสที่ตรงมาก 75-95, ปานกลาง 50-74, น้อย 30-49
- hours_ago: ควรมีหลากหลาย ตั้งแต่ 1-72 ชั่วโมง`;

export async function analyzeScraperLeads(messages) {
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
    max_tokens: 900,
  });

  if (!response.ok) throw new Error('Analyzer API error');
  const data = await response.json();
  const raw = data.choices[0]?.message?.content || '{}';
  const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonStr);
}
