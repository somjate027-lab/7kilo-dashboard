/* ─────────────────────────────────────────────
   Cases API — ดึง / อัปเดต คดีของ user จาก Supabase
───────────────────────────────────────────── */
import { supabase } from './supabase';

export const fetchUserCases = async () => {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('fetchUserCases error:', error); return []; }
  return data ?? [];
};

export const updateCaseStatus = async (id, status) => {
  const { error } = await supabase
    .from('cases')
    .update({ status })
    .eq('id', id);
  if (error) console.error('updateCaseStatus error:', error);
  return !error;
};

export const deleteCase = async (id) => {
  const { error } = await supabase
    .from('cases')
    .delete()
    .eq('id', id);
  if (error) console.error('deleteCase error:', error);
  return !error;
};
