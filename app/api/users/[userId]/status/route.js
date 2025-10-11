import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/apiAuth';
import { z } from 'zod';

const statusSchema = z.object({
  isActive: z.boolean()
});

// PATCH /api/users/[userId]/status - Toggle user active status
export async function PATCH(request, { params }) {
  return requireAuth(request, async (req, user) => {
    try {
      const { userId } = params;

      // Only admin and primary_admin can change user status
      if (user.role !== 'primary_admin' && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const validation = statusSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: validation.error.errors },
          { status: 400 }
        );
      }

      const { isActive } = validation.data;

      // Get the user being updated
      const { data: targetUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('company_id', user.companyId)
        .single();

      if (fetchError || !targetUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Prevent deactivating primary admin
      if (targetUser.role === 'primary_admin' && !isActive) {
        return NextResponse.json(
          { error: 'Cannot deactivate primary admin' },
          { status: 403 }
        );
      }

      // Prevent deactivating yourself
      if (userId === user.userId && !isActive) {
        return NextResponse.json(
          { error: 'Cannot deactivate your own account' },
          { status: 403 }
        );
      }

      // Update user status
      const { error: updateError } = await supabase
        .from('users')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .eq('company_id', user.companyId);

      if (updateError) {
        console.error('Error updating user status:', updateError);
        return NextResponse.json(
          { error: 'Failed to update user status' },
          { status: 500 }
        );
      }

      // If deactivating, delete all active sessions
      if (!isActive) {
        await supabase
          .from('user_sessions')
          .delete()
          .eq('user_id', userId);
      }

      // Create audit log
      await supabase.from('audit_log').insert({
        company_id: user.companyId,
        user_id: user.userId,
        action: isActive ? 'activate_user' : 'deactivate_user',
        resource_type: 'user',
        resource_id: userId,
        details: { username: targetUser.username }
      });

      return NextResponse.json({
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error in PATCH /api/users/[userId]/status:', error);
      return NextResponse.json(
        { error: 'An error occurred while updating user status' },
        { status: 500 }
      );
    }
  });
}
