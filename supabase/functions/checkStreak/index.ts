import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req: Request) => {
  try {
    const { user_id } = await req.json();

    const { data: streak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user_id)
      .single();

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentStreak = 1;
    let longestStreak = streak?.longest_streak ?? 1;

    if (streak) {
      if (streak.last_deposit_date === today) {
        currentStreak = streak.current_streak;
      } else if (streak.last_deposit_date === yesterday) {
        currentStreak = streak.current_streak + 1;
      } else {
        currentStreak = 1;
      }
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    await supabase.from('user_streaks').upsert({
      user_id,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_deposit_date: today,
      updated_at: new Date().toISOString(),
    });

    const milestones = [7, 30, 100];
    for (const milestone of milestones) {
      if (currentStreak === milestone) {
        await supabase.from('notifications').insert({
          user_id,
          title: `Streak ${milestone} Hari!`,
          body: `Anda telah melakukan deposit ${milestone} hari berturut-turut. Pertahankan!`,
          type: 'achievement_unlocked',
          data: { streak_days: milestone },
        });
      }
    }

    return new Response(JSON.stringify({ currentStreak, longestStreak }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
