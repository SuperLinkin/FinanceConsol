import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/apiAuth';

// GET /api/permissions - Get all available permissions
export async function GET(request) {
  return requireAuth(request, async (req, user) => {
    try {
      // Fetch all permissions grouped by category
      const { data: permissions, error } = await supabase
        .from('permissions')
        .select(`
          *,
          permission_categories (
            id,
            category_name,
            description,
            display_order
          )
        `)
        .order('permission_name', { ascending: true });

      if (error) {
        console.error('Error fetching permissions:', error);
        return NextResponse.json(
          { error: 'Failed to fetch permissions' },
          { status: 500 }
        );
      }

      // Group permissions by category
      const grouped = permissions.reduce((acc, perm) => {
        const categoryName = perm.permission_categories?.category_name || 'Other';
        if (!acc[categoryName]) {
          acc[categoryName] = {
            categoryId: perm.permission_categories?.id,
            categoryName,
            description: perm.permission_categories?.description,
            displayOrder: perm.permission_categories?.display_order || 999,
            permissions: []
          };
        }
        acc[categoryName].permissions.push({
          id: perm.id,
          name: perm.permission_name,
          slug: perm.permission_slug,
          description: perm.description,
          isSystemPermission: perm.is_system_permission
        });
        return acc;
      }, {});

      // Convert to array and sort by display order
      const categories = Object.values(grouped).sort((a, b) => a.displayOrder - b.displayOrder);

      return NextResponse.json({ categories });
    } catch (error) {
      console.error('Error in GET /api/permissions:', error);
      return NextResponse.json(
        { error: 'An error occurred while fetching permissions' },
        { status: 500 }
      );
    }
  });
}
