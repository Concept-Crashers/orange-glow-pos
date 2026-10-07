import { createFileRoute } from '@tanstack/react-router';

// Temporary one-off: creates the three demo staff accounts. Removed after use.
export const Route = createFileRoute('/api/public/seed-demo')({
  server: { handlers: { POST: async ({ request }) => {
    if (request.headers.get('x-seed') !== 'tillpoint-demo-2026') return new Response('no', { status: 403 });
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const accounts = [
      { email: 'admin@tillpoint.demo', name: 'Amina Admin', role: 'admin' as const },
      { email: 'manager@tillpoint.demo', name: 'Moses Manager', role: 'manager' as const },
      { email: 'cashier@tillpoint.demo', name: 'Carol Cashier', role: 'cashier' as const },
    ];
    const out: string[] = [];
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    for (const a of accounts) {
      let id = list?.users.find(u => u.email === a.email)?.id;
      if (!id) {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({ email: a.email, password: 'Tillpoint#2026', email_confirm: true, user_metadata: { full_name: a.name } });
        if (error) { out.push(`${a.email}: ${error.message}`); continue; }
        id = data.user.id;
      }
      await supabaseAdmin.from('user_roles').delete().eq('user_id', id);
      const { error } = await supabaseAdmin.from('user_roles').insert({ user_id: id, role: a.role });
      out.push(`${a.email}: ${error ? error.message : 'ok'}`);
    }
    return Response.json(out);
  } } },
});
