import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth';

// GET - Fetch all note descriptions for a company
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');

    if (!companyId) {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    // Verify the requested company matches the user's company
    if (companyId !== payload.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('note_descriptions')
      .select('*')
      .eq('company_id', companyId)
      .order('note_ref', { ascending: true });

    if (error) {
      console.error('Error fetching note descriptions:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/note-descriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update a note description (upsert)
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();

    const {
      company_id,
      note_ref,
      note_title,
      note_content,
      statement_type,
      class_name,
      subclass_name,
      note_name,
    } = body;

    // Validation
    if (!company_id || !note_ref || !note_title || !statement_type) {
      return NextResponse.json(
        { error: 'company_id, note_ref, note_title, and statement_type are required' },
        { status: 400 }
      );
    }

    // Verify the requested company matches the user's company
    if (company_id !== payload.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if note description already exists
    const { data: existing } = await supabaseAdmin
      .from('note_descriptions')
      .select('id')
      .eq('company_id', company_id)
      .eq('note_ref', note_ref)
      .single();

    let result;
    if (existing) {
      // Update existing note description
      const { data, error } = await supabaseAdmin
        .from('note_descriptions')
        .update({
          note_title,
          note_content,
          statement_type,
          class_name,
          subclass_name,
          note_name,
          updated_by: payload.userId,
        })
        .eq('company_id', company_id)
        .eq('note_ref', note_ref)
        .select()
        .single();

      if (error) {
        console.error('Error updating note description:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Insert new note description
      const { data, error } = await supabaseAdmin
        .from('note_descriptions')
        .insert({
          company_id,
          note_ref,
          note_title,
          note_content,
          statement_type,
          class_name,
          subclass_name,
          note_name,
          created_by: payload.userId,
          updated_by: payload.userId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating note description:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      result = data;
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error in POST /api/note-descriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a note description
export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const noteRef = searchParams.get('note_ref');

    if (!companyId || !noteRef) {
      return NextResponse.json(
        { error: 'company_id and note_ref are required' },
        { status: 400 }
      );
    }

    // Verify the requested company matches the user's company
    if (companyId !== payload.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabaseAdmin
      .from('note_descriptions')
      .delete()
      .eq('company_id', companyId)
      .eq('note_ref', noteRef);

    if (error) {
      console.error('Error deleting note description:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/note-descriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
