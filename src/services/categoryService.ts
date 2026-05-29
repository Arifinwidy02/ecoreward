import { supabase } from './supabase';
import type { WasteCategory } from '../types/models';

export async function getAllCategories(): Promise<WasteCategory[]> {
  const { data, error } = await supabase
    .from('waste_categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function getCategoryByName(name: string): Promise<WasteCategory | null> {
  const { data, error } = await supabase
    .from('waste_categories')
    .select('*')
    .eq('name', name)
    .single();
  if (error) return null;
  return data;
}
