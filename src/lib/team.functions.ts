import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

const createInput = z.object({
  email: z.string().email().max(200),
  password: z.string().min(6).max(100),
  fullName: z.string().trim().min(1).max(100),
  role: z.enum(['cashier', 'manager', 'admin']),
});

export const createStaffMember = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc('has_role', {
      _user_id: context.userId,
      _role: 'admin',
    });
    if (!isAdmin) return { ok: false as const, error: 'Only administrators can add staff members.' };

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (createErr) {
      const msg = createErr.message.toLowerCase();
      if (msg.includes('already') || msg.includes('exists') || msg.includes('registered')) {
        return { ok: false as const, error: 'An account with this email already exists.' };
      }
      return { ok: false as const, error: `Could not create the account: ${createErr.message}` };
    }

    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert({ id: newUser.user.id, email: data.email, full_name: data.fullName });

    const { error: roleErr } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: newUser.user.id, role: data.role });

    if (profileErr || roleErr) {
      const detail = profileErr?.message ?? roleErr?.message ?? 'Unknown error';
      return { ok: false as const, error: `Account created but role assignment failed: ${detail}. Please set the role manually.` };
    }

    return { ok: true as const, userId: newUser.user.id };
  });

const removeInput = z.object({ userId: z.string().uuid() });

export const removeStaffMember = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => removeInput.parse(d))
  .handler(async ({ data, context }) => {
    if (data.userId === context.userId) {
      return { ok: false as const, error: 'You cannot remove your own account.' };
    }
    const { data: isAdmin } = await context.supabase.rpc('has_role', {
      _user_id: context.userId,
      _role: 'admin',
    });
    if (!isAdmin) return { ok: false as const, error: 'Only administrators can remove staff members.' };

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

    const { error: roleErr } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', data.userId);
    if (roleErr) return { ok: false as const, error: `Could not remove roles: ${roleErr.message}` };

    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', data.userId);
    if (profileErr) return { ok: false as const, error: `Could not remove profile: ${profileErr.message}` };

    const { error: userErr } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (userErr) return { ok: false as const, error: `Profile removed but account deletion failed: ${userErr.message}` };

    return { ok: true as const };
  });
