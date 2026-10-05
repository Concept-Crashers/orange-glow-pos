import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

const input = z.object({ question: z.string().trim().min(3).max(1000), data: z.any() });

export const askSalesInsights = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data, context }) => {
    const [{ data: mgr }, { data: admin }] = await Promise.all([
      context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'manager' }),
      context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' }),
    ]);
    if (!mgr && !admin) return { ok: false as const, error: 'Only store managers can use sales insights.' };
    const { analyzeSales, GatewayError } = await import('./insights.server');
    try { return { ok: true as const, text: await analyzeSales(data.question, data.data) }; }
    catch (e) { return { ok: false as const, error: e instanceof GatewayError ? e.message : 'The analysis could not be completed.' }; }
  });
