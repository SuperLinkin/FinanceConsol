import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/apiAuth';
import { z } from 'zod';

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['primary_admin', 'admin', 'manager', 'user', 'viewer']).optional(),
  isActive: z.boolean().optional()
});

// PUT /api/users/[userId] - Update user
export async function PUT(request, { params }) {
  return requireAuth(request, async (req, user) => {
    try {
      const { userId } = params;

      // Only admin and primary_admin can update users
      if (user.role !== 'primary_admin' && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const validation = updateUserSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: validation.error.errors },
          { status: 400 }
        );
      }

      const { firstName, lastName, role, isActive } = validation.data;

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

      // Prevent modifying primary admin unless you are the primary admin
      if (targetUser.role === 'primary_admin' && user.role !== 'primary_admin') {
        return NextResponse.json(
          { error: 'Cannot modify primary admin' },
          { status: 403 }
        );
      }

      // Prevent changing your own role
      if (userId === user.userId && role && role !== targetUser.role) {
        return NextResponse.json(
          { error: 'Cannot change your own role' },
          { status: 403 }
        );
      }

      // Prevent non-primary admins from creating new primary admins
      if (role === 'primary_admin' && user.role !== 'primary_admin') {
        return NextResponse.json(
          { error: 'Only primary admin can assign primary admin role' },
          { status: 403 }
        );
      }

      // Build update object
      const updates = {};
      if (firstName !== undefined) updates.first_name = firstName;
      if (lastName !== undefined) updates.last_name = lastName;
      if (role !== undefined) updates.role = role;
      if (isActive !== undefined) updates.is_active = isActive;
      updates.updated_at = new Date().toISOString();

      // Update user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .eq('company_id', user.companyId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        );
      }

      // Create audit log
      await supabase.from('audit_log').insert({
        company_id: user.companyId,
        user_id: user.userId,
        action: 'update_user',
        resource_type: 'user',
        resource_id: userId,
        details: { updates }
      });

      return NextResponse.json({
        message: 'User updated successfully',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          role: updatedUser.role,
          is_active: updatedUser.is_active,
          is_verified: updatedUser.is_verified
        }
      });
    } catch (error) {
      console.error('Error in PUT /api/users/[userId]:', error);
      return NextResponse.json(
        { error: 'An error occurred while updating the user' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/users/[userId] - Delete user
export async function DELETE(request, { params }) {
  return requireAuth(request, async (req, user) => {
    try {
      const { userId } = params;

      // Only admin and primary_admin can delete users
      if (user.role !== 'primary_admin' && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 403 }
        );
      }

      // Get the user being deleted
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

      // Prevent deleting primary admin
      if (targetUser.role === 'primary_admin') {
        return NextResponse.json(
          { error: 'Cannot delete primary admin' },
          { status: 403 }
        );
      }

      // Prevent deleting yourself
      if (userId === user.userId) {
        return NextResponse.json(
          { error: 'Cannot delete your own account' },
          { status: 403 }
        );
      }

      // Delete user sessions first
      await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', userId);

      // Delete user
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)
        .eq('company_id', user.companyId);

      if (deleteError) {
        console.error('Error deleting user:', deleteError);
        return NextResponse.json(
          { error: 'Failed to delete user' },
          { status: 500 }
        );
      }

      // Create audit log
      await supabase.from('audit_log').insert({
        company_id: user.companyId,
        user_id: user.userId,
        action: 'delete_user',
        resource_type: 'user',
        resource_id: userId,
        details: { deleted_user: targetUser.username }
      });

      return NextResponse.json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error in DELETE /api/users/[userId]:', error);
      return NextResponse.json(
        { error: 'An error occurred while deleting the user' },
        { status: 500 }
      );
    }
  });
}
