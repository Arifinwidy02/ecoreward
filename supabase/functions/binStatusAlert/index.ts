import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (_req: Request) => {
  try {
    const { data: fullBins } = await supabase
      .from('smart_netbins')
      .select('*')
      .gte('capacity_percent', 95)
      .neq('status', 'full');

    if (!fullBins?.length) {
      return new Response(JSON.stringify({ message: 'No bins to update' }), { status: 200 });
    }

    for (const bin of fullBins) {
      await supabase.from('smart_netbins').update({
        status: 'full',
        last_updated: new Date().toISOString(),
      }).eq('id', bin.id);

      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .limit(100);

      if (users) {
        const notifications = users.map((u) => ({
          user_id: u.id,
          title: `Bin Penuh: ${bin.name}`,
          body: `Smart Netbin di ${bin.address || bin.name} telah penuh. Silakan cari bin lain.`,
          type: 'bin_full',
          data: { bin_id: bin.id },
        }));

        await supabase.from('notifications').insert(notifications);
      }
    }

    return new Response(JSON.stringify({ updated: fullBins.length }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
