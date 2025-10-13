import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Query the close_users table (isolated from reporting users)
    const { data: user, error } = await supabase
      .from('close_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return Response.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return Response.json(
        { error: 'Account is temporarily locked due to multiple failed login attempts' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      // Increment failed login attempts
      const failedAttempts = (user.failed_login_attempts || 0) + 1;
      const updateData = {
        failed_login_attempts: failedAttempts
      };

      // Lock account after 5 failed attempts for 30 minutes
      if (failedAttempts >= 5) {
        updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      }

      await supabase
        .from('close_users')
        .update(updateData)
        .eq('id', user.id);

      return Response.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Successful login - update last login and reset failed attempts
    await supabase
      .from('close_users')
      .update({
        last_login_at: new Date().toISOString(),
        failed_login_attempts: 0,
        locked_until: null
      })
      .eq('id', user.id);

    // Return user data (excluding password_hash)
    const { password_hash, ...userData } = user;

    return Response.json({
      success: true,
      user: {
        id: userData.id,
        username: userData.username,
        full_name: userData.full_name,
        email: userData.email,
        company_name: userData.company_name,
        company_id: userData.company_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
