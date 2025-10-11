import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { supabase, supabaseAdmin } from './supabase';

// Validate JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set. Please configure it in your .env file.');
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Hash password
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Create session token
export async function createSessionToken(userId, companyId, role, environment = 'production') {
  const token = await new SignJWT({
    userId,
    companyId,
    role,
    environment
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  // Store session in database using admin client to bypass RLS
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const client = supabaseAdmin || supabase;
  await client.from('user_sessions').insert([{
    user_id: userId,
    company_id: companyId,
    session_token: token,
    environment,
    expires_at: expiresAt.toISOString()
  }]);

  return token;
}

// Verify session token
export async function verifySessionToken(token) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);

    // Check if session exists in database (use admin client to bypass RLS)
    const client = supabaseAdmin || supabase;
    const { data: session } = await client
      .from('user_sessions')
      .select('*')
      .eq('session_token', token)
      .eq('is_active', true)
      .single();

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      return null;
    }

    // Update last activity (use admin client to bypass RLS)
    await client
      .from('user_sessions')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', session.id);

    return verified.payload;
  } catch (error) {
    return null;
  }
}

// Authenticate user
export async function authenticateUser(username, password) {
  try {
    // Use admin client to bypass RLS for authentication
    // This is necessary because we don't have a JWT token yet during login
    const client = supabaseAdmin || supabase;

    // Find user by username
    const { data: user, error } = await client
      .from('users')
      .select(`
        *,
        companies:company_id (
          id,
          company_name,
          company_slug,
          subscription_status,
          production_enabled,
          sandbox_enabled
        )
      `)
      .eq('username', username)
      .eq('is_active', true)
      .single();

    console.log('User lookup for username:', username);
    console.log('User found:', user ? 'YES' : 'NO');
    console.log('Error:', error);

    if (error || !user) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return { success: false, error: 'Account is temporarily locked. Please try again later.' };
    }

    // Verify password
    console.log('Verifying password...');
    console.log('Password hash from DB:', user.password_hash);
    const isValidPassword = await verifyPassword(password, user.password_hash);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      // Increment failed login attempts (use admin client to bypass RLS)
      const failedAttempts = (user.failed_login_attempts || 0) + 1;
      const updates = { failed_login_attempts: failedAttempts };

      // Lock account after 5 failed attempts
      if (failedAttempts >= 5) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 30);
        updates.locked_until = lockUntil.toISOString();
      }

      await client
        .from('users')
        .update(updates)
        .eq('id', user.id);

      return { success: false, error: 'Invalid username or password' };
    }

    // Reset failed attempts and update last login (use admin client to bypass RLS)
    await client
      .from('users')
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        last_login_at: new Date().toISOString()
      })
      .eq('id', user.id);

    // Create audit log entry (use admin client to bypass RLS)
    await client.from('audit_log').insert([{
      company_id: user.company_id,
      user_id: user.id,
      action: 'login',
      resource_type: 'auth'
    }]);

    // Create session token
    const token = await createSessionToken(
      user.id,
      user.company_id,
      user.role,
      'production'
    );

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_primary: user.is_primary,
        company_id: user.company_id,
        company: user.companies
      },
      token
    };
  } catch (error) {
    // Log error server-side only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Authentication error:', error);
    }
    return { success: false, error: 'An error occurred during authentication' };
  }
}

// Get current user from token
export async function getCurrentUser(token) {
  const payload = await verifySessionToken(token);

  if (!payload) {
    return null;
  }

  // Use admin client to bypass RLS
  const client = supabaseAdmin || supabase;
  const { data: user } = await client
    .from('users')
    .select(`
      *,
      companies:company_id (
        id,
        company_name,
        company_slug,
        subscription_status,
        production_enabled,
        sandbox_enabled
      )
    `)
    .eq('id', payload.userId)
    .eq('is_active', true)
    .single();

  return user;
}

// Logout user
export async function logoutUser(token) {
  // Use admin client to bypass RLS
  const client = supabaseAdmin || supabase;
  await client
    .from('user_sessions')
    .delete()
    .eq('session_token', token);
}

// Check permission
export async function checkPermission(userId, permissionName) {
  // Use admin client to bypass RLS
  const client = supabaseAdmin || supabase;
  const { data: user } = await client
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (!user) return false;

  const { data: rolePermission } = await client
    .from('role_permissions')
    .select('permission_id, permissions(name)')
    .eq('role', user.role);

  return rolePermission?.some(rp => rp.permissions.name === permissionName) || false;
}
