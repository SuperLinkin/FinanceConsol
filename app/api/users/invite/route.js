import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/apiAuth';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['admin', 'manager', 'user', 'viewer'])
});

// POST /api/users/invite - Invite a new user
export async function POST(request) {
  return requireAuth(request, async (req, user) => {
    try {
      // Only admin and primary_admin can invite users
      if (user.role !== 'primary_admin' && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const validation = inviteSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: validation.error.errors },
          { status: 400 }
        );
      }

      const { email, firstName, lastName, role } = validation.data;

      // Check if user with this email already exists in the company
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .eq('company_id', user.companyId)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: 'A user with this email already exists in your company' },
          { status: 400 }
        );
      }

      // Generate username from email
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

      // Check if username is taken, add number if needed
      let finalUsername = username;
      let counter = 1;
      while (true) {
        const { data: usernameCheck } = await supabase
          .from('users')
          .select('id')
          .eq('username', finalUsername)
          .eq('company_id', user.companyId)
          .single();

        if (!usernameCheck) break;
        finalUsername = `${username}${counter}`;
        counter++;
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase();
      const passwordHash = await hashPassword(tempPassword);

      // Create the user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          company_id: user.companyId,
          username: finalUsername,
          email,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
          role,
          is_primary: false,
          is_active: true,
          is_verified: false,
          failed_login_attempts: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      // Create invitation record
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const invitationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

      const { error: inviteError } = await supabase
        .from('user_invitations')
        .insert({
          company_id: user.companyId,
          email,
          invited_by: user.userId,
          role,
          status: 'pending',
          invitation_token: invitationToken,
          expires_at: expiresAt.toISOString()
        });

      if (inviteError) {
        console.error('Error creating invitation:', inviteError);
      }

      // Create audit log
      await supabase.from('audit_log').insert({
        company_id: user.companyId,
        user_id: user.userId,
        action: 'invite_user',
        resource_type: 'user',
        resource_id: newUser.id,
        details: { email, role, invited_username: finalUsername }
      });

      // TODO: Send invitation email with temporary password
      // For now, we'll return it in the response (in production, send via email)

      return NextResponse.json({
        message: 'User invited successfully',
        user: {
          id: newUser.id,
          username: finalUsername,
          email: newUser.email,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          role: newUser.role
        },
        temporaryCredentials: {
          username: finalUsername,
          password: tempPassword,
          note: 'Send these credentials to the user securely. They will be required to change their password on first login.'
        }
      });
    } catch (error) {
      console.error('Error in POST /api/users/invite:', error);
      return NextResponse.json(
        { error: 'An error occurred while inviting the user' },
        { status: 500 }
      );
    }
  });
}
