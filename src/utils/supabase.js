import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, key);

// บันทึก case ลง Supabase
export const saveCaseToSupabase = async (summary) => {
  const { data, error } = await supabase
    .from('cases')
    .insert([{
      plate:          summary.victim?.license_plate  || null,
      case_type:      summary.incident?.type         || null,
      route:          summary.route                  || null,
      car_brand:      summary.victim?.car_brand      || null,
      car_model:      summary.victim?.car_model      || null,
      color:          summary.victim?.color          || null,
      priority:       summary.priority               || 'medium',
      description:    summary.incident?.description  || null,
      marketplace_url:summary.incident?.platform     || null,
      has_photo:      summary.evidence?.has_photo    || false,
      has_document:   summary.evidence?.has_document || false,
      notes:          summary.evidence?.notes        || null,
      status:         'open',
    }])
    .select();

  if (error) {
    console.error('Supabase insert error:', error);
    return { success: false, error };
  }
  return { success: true, data };
};
