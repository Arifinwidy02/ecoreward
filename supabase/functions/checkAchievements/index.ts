import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req: Request) => {
  try {
    const { user_id } = await req.json();

    const { data: profile } = await supabase
      .from('profiles')
      .select('total_waste_kg, level')
      .eq('id', user_id)
      .single();

    const { data: streak } = await supabase
      .from('user_streaks')
      .select('current_streak')
      .eq('user_id', user_id)
      .single();

    const { count: depositCount } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('type', 'deposit')
      .eq('status', 'verified');

    const { data: categories } = await supabase
      .from('transactions')
      .select('category_id')
      .eq('user_id', user_id)
      .eq('type', 'deposit')
      .eq('status', 'verified');

    const uniqueCategories = new Set(categories?.map((c) => c.category_id)).size;

    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*');

    const { data: unlocked } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user_id);

    const unlockedIds = new Set(unlocked?.map((u) => u.achievement_id));

    const stats = {
      depositCount: depositCount ?? 0,
      totalKg: profile?.total_waste_kg ?? 0,
      currentStreak: streak?.current_streak ?? 0,
      uniqueCategoryCount: uniqueCategories,
      level: profile?.level ?? 1,
    };

    const newlyUnlocked: string[] = [];

    for (const achievement of allAchievements ?? []) {
      if (unlockedIds.has(achievement.id)) continue;

      const criteria = achievement.criteria as {
        type: string;
        threshold: number;
      };

      let met = false;
      switch (criteria.type) {
        case 'deposit_count': met = stats.depositCount >= criteria.threshold; break;
        case 'total_kg': met = stats.totalKg >= criteria.threshold; break;
        case 'streak_days': met = stats.currentStreak >= criteria.threshold; break;
        case 'category_count': met = stats.uniqueCategoryCount >= criteria.threshold; break;
        case 'level': met = stats.level >= criteria.threshold; break;
      }

      if (met) {
        await supabase.from('user_achievements').insert({
          user_id,
          achievement_id: achievement.id,
        });

        await supabase.from('notifications').insert({
          user_id,
          title: `Achievement Terbuka: ${achievement.name}`,
          body: achievement.description,
          type: 'achievement_unlocked',
          data: { achievement_id: achievement.id },
        });

        newlyUnlocked.push(achievement.name);
      }
    }

    return new Response(JSON.stringify({ newlyUnlocked }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
