import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/apiAuth';

// GET /api/users - Get all users for the company
export async function GET(request) {
  return requireAuth(request, async (req, user) => {
    try {
      // Only admin and primary_admin can view all users
      if (user.role !== 'primary_admin' && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 403 }
        );
      }

      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', user.companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
          { error: 'Failed to fetch users' },
          { status: 500 }
        );
      }

      // Remove sensitive data
      const sanitizedUsers = users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        first_name: u.first_name,
        last_name: u.last_name,
        role: u.role,
        is_active: u.is_active,
        is_verified: u.is_verified,
        is_primary: u.is_primary,
        last_login_at: u.last_login_at,
        created_at: u.created_at
      }));

      return NextResponse.json({ users: sanitizedUsers });
    } catch (error) {
      console.error('Error in GET /api/users:', error);
      return NextResponse.json(
        { error: 'An error occurred while fetching users' },
        { status: 500 }
      );
    }
  });
}
