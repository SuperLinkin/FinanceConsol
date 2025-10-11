import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/apiAuth';
import { z } from 'zod';

const updateRoleSchema = z.object({
  roleName: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  permissions: z.array(z.string().uuid()).optional(),
  isActive: z.boolean().optional()
});

// PUT /api/roles/[roleId] - Update a custom role
export async function PUT(request, { params }) {
  return requireAuth(request, async (req, user) => {
    try {
      const { roleId } = params;

      // Only admin and primary_admin can update roles
      if (user.role !== 'primary_admin' && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const validation = updateRoleSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: validation.error.errors },
          { status: 400 }
        );
      }

      const { roleName, description, permissions, isActive } = validation.data;

      // Get the role
      const { data: role, error: fetchError } = await supabase
        .from('custom_roles')
        .select('*')
        .eq('id', roleId)
        .eq('company_id', user.companyId)
        .single();

      if (fetchError || !role) {
        return NextResponse.json(
          { error: 'Role not found' },
          { status: 404 }
        );
      }

      // Cannot modify system roles
      if (role.is_system_role) {
        return NextResponse.json(
          { error: 'Cannot modify system roles' },
          { status: 403 }
        );
      }

      // Build update object
      const updates = {};
      if (roleName !== undefined) {
        updates.role_name = roleName;
        updates.role_slug = roleName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      }
      if (description !== undefined) updates.description = description;
      if (isActive !== undefined) updates.is_active = isActive;
      updates.updated_at = new Date().toISOString();

      // Update role
      const { error: updateError } = await supabase
        .from('custom_roles')
        .update(updates)
        .eq('id', roleId)
        .eq('company_id', user.companyId);

      if (updateError) {
        console.error('Error updating role:', updateError);
        return NextResponse.json(
          { error: 'Failed to update role' },
          { status: 500 }
        );
      }

      // Update permissions if provided
      if (permissions !== undefined) {
        // Delete existing permissions
        await supabase
          .from('role_permissions')
          .delete()
          .eq('custom_role_id', roleId);

        // Add new permissions
        if (permissions.length > 0) {
          const permissionInserts = permissions.map(permId => ({
            custom_role_id: roleId,
            permission_id: permId
          }));

          const { error: permError } = await supabase
            .from('role_permissions')
            .insert(permissionInserts);

          if (permError) {
            console.error('Error updating permissions:', permError);
            return NextResponse.json(
              { error: 'Failed to update permissions' },
              { status: 500 }
            );
          }
        }
      }

      // Create audit log
      await supabase.from('audit_log').insert({
        company_id: user.companyId,
        user_id: user.userId,
        action: 'update_custom_role',
        resource_type: 'role',
        resource_id: roleId,
        details: { updates, permissionCount: permissions?.length }
      });

      return NextResponse.json({
        message: 'Role updated successfully'
      });
    } catch (error) {
      console.error('Error in PUT /api/roles/[roleId]:', error);
      return NextResponse.json(
        { error: 'An error occurred while updating the role' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/roles/[roleId] - Delete a custom role
export async function DELETE(request, { params }) {
  return requireAuth(request, async (req, user) => {
    try {
      const { roleId } = params;

      // Only admin and primary_admin can delete roles
      if (user.role !== 'primary_admin' && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 403 }
        );
      }

      // Get the role
      const { data: role, error: fetchError } = await supabase
        .from('custom_roles')
        .select('*')
        .eq('id', roleId)
        .eq('company_id', user.companyId)
        .single();

      if (fetchError || !role) {
        return NextResponse.json(
          { error: 'Role not found' },
          { status: 404 }
        );
      }

      // Cannot delete system roles
      if (role.is_system_role) {
        return NextResponse.json(
          { error: 'Cannot delete system roles' },
          { status: 403 }
        );
      }

      // Check if any users are assigned this role
      const { data: usersWithRole, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('company_id', user.companyId)
        .eq('role', role.role_slug)
        .limit(1);

      if (userCheckError) {
        console.error('Error checking users:', userCheckError);
      }

      if (usersWithRole && usersWithRole.length > 0) {
        return NextResponse.json(
          { error: 'Cannot delete role that is assigned to users' },
          { status: 400 }
        );
      }

      // Delete role permissions first (cascade should handle this, but being explicit)
      await supabase
        .from('role_permissions')
        .delete()
        .eq('custom_role_id', roleId);

      // Delete the role
      const { error: deleteError } = await supabase
        .from('custom_roles')
        .delete()
        .eq('id', roleId)
        .eq('company_id', user.companyId);

      if (deleteError) {
        console.error('Error deleting role:', deleteError);
        return NextResponse.json(
          { error: 'Failed to delete role' },
          { status: 500 }
        );
      }

      // Create audit log
      await supabase.from('audit_log').insert({
        company_id: user.companyId,
        user_id: user.userId,
        action: 'delete_custom_role',
        resource_type: 'role',
        resource_id: roleId,
        details: { roleName: role.role_name }
      });

      return NextResponse.json({
        message: 'Role deleted successfully'
      });
    } catch (error) {
      console.error('Error in DELETE /api/roles/[roleId]:', error);
      return NextResponse.json(
        { error: 'An error occurred while deleting the role' },
        { status: 500 }
      );
    }
  });
}
