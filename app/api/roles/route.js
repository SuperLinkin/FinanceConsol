import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/apiAuth';
import { z } from 'zod';

const createRoleSchema = z.object({
  roleName: z.string().min(1).max(100),
  description: z.string().optional(),
  permissions: z.array(z.string().uuid())
});

// GET /api/roles - Get all roles for the company
export async function GET(request) {
  return requireAuth(request, async (req, user) => {
    try {
      // Fetch custom roles with permission counts
      const { data: roles, error } = await supabase
        .from('custom_roles')
        .select(`
          *,
          role_permissions (
            permission_id,
            permissions (
              id,
              permission_name,
              permission_slug,
              description,
              category_id,
              permission_categories (
                category_name
              )
            )
          )
        `)
        .eq('company_id', user.companyId)
        .eq('is_active', true)
        .order('is_system_role', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching roles:', error);
        return NextResponse.json(
          { error: 'Failed to fetch roles' },
          { status: 500 }
        );
      }

      // Transform the data to include permissions array
      const transformedRoles = roles.map(role => ({
        id: role.id,
        roleName: role.role_name,
        roleSlug: role.role_slug,
        description: role.description,
        isSystemRole: role.is_system_role,
        isActive: role.is_active,
        createdAt: role.created_at,
        permissions: role.role_permissions.map(rp => ({
          id: rp.permissions.id,
          name: rp.permissions.permission_name,
          slug: rp.permissions.permission_slug,
          description: rp.permissions.description,
          category: rp.permissions.permission_categories?.category_name
        })),
        permissionCount: role.role_permissions.length
      }));

      return NextResponse.json({ roles: transformedRoles });
    } catch (error) {
      console.error('Error in GET /api/roles:', error);
      return NextResponse.json(
        { error: 'An error occurred while fetching roles' },
        { status: 500 }
      );
    }
  });
}

// POST /api/roles - Create a new custom role
export async function POST(request) {
  return requireAuth(request, async (req, user) => {
    try {
      // Only admin and primary_admin can create roles
      if (user.role !== 'primary_admin' && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const validation = createRoleSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: validation.error.errors },
          { status: 400 }
        );
      }

      const { roleName, description, permissions } = validation.data;

      // Create role slug from name
      const roleSlug = roleName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

      // Check if role with same slug already exists
      const { data: existingRole } = await supabase
        .from('custom_roles')
        .select('id')
        .eq('company_id', user.companyId)
        .eq('role_slug', roleSlug)
        .single();

      if (existingRole) {
        return NextResponse.json(
          { error: 'A role with this name already exists' },
          { status: 400 }
        );
      }

      // Create the role
      const { data: newRole, error: roleError } = await supabase
        .from('custom_roles')
        .insert({
          company_id: user.companyId,
          role_name: roleName,
          role_slug: roleSlug,
          description: description || null,
          is_system_role: false,
          is_active: true,
          created_by: user.userId
        })
        .select()
        .single();

      if (roleError) {
        console.error('Error creating role:', roleError);
        return NextResponse.json(
          { error: 'Failed to create role' },
          { status: 500 }
        );
      }

      // Add permissions to the role
      if (permissions && permissions.length > 0) {
        const permissionInserts = permissions.map(permId => ({
          custom_role_id: newRole.id,
          permission_id: permId
        }));

        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(permissionInserts);

        if (permError) {
          console.error('Error adding permissions:', permError);
          // Rollback: delete the role
          await supabase.from('custom_roles').delete().eq('id', newRole.id);
          return NextResponse.json(
            { error: 'Failed to assign permissions to role' },
            { status: 500 }
          );
        }
      }

      // Create audit log
      await supabase.from('audit_log').insert({
        company_id: user.companyId,
        user_id: user.userId,
        action: 'create_custom_role',
        resource_type: 'role',
        resource_id: newRole.id,
        details: { roleName, permissionCount: permissions?.length || 0 }
      });

      return NextResponse.json({
        message: 'Role created successfully',
        role: {
          id: newRole.id,
          roleName: newRole.role_name,
          roleSlug: newRole.role_slug,
          description: newRole.description
        }
      }, { status: 201 });
    } catch (error) {
      console.error('Error in POST /api/roles:', error);
      return NextResponse.json(
        { error: 'An error occurred while creating the role' },
        { status: 500 }
      );
    }
  });
}
