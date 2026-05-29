import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req: Request) => {
  try {
    const { user_id, category_id, weight_kg, bin_id, photo_url } = await req.json();

    const { data: category, error: catError } = await supabase
      .from('waste_categories')
      .select('points_per_kg')
      .eq('id', category_id)
      .single();
    if (catError || !category) {
      return new Response(JSON.stringify({ error: 'Category not found' }), { status: 404 });
    }

    const points = Math.round(category.points_per_kg * weight_kg);

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id,
        category_id,
        bin_id,
        photo_url,
        weight_kg,
        points_delta: points,
        type: 'deposit',
        status: 'verified',
        verification_method: 'photo_only',
      })
      .select('*')
      .single();
    if (txError) throw txError;

    const { data: profile } = await supabase
      .from('profiles')
      .select('eco_points, total_waste_kg')
      .eq('id', user_id)
      .single();

    const newPoints = (profile?.eco_points ?? 0) + points;
    const newWasteKg = (profile?.total_waste_kg ?? 0) + weight_kg;
    const newLevel = Math.floor(Math.sqrt(newPoints / 100)) + 1;

    await supabase.from('profiles').update({
      eco_points: newPoints,
      total_waste_kg: newWasteKg,
      level: newLevel,
      updated_at: new Date().toISOString(),
    }).eq('id', user_id);

    return new Response(JSON.stringify({ transaction, points }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
