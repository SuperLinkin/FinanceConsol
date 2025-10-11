import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth';

// GET - Fetch all elimination entries for the user's company
export async function GET() {
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

    console.log('[API /elimination-entries GET] Fetching entries for company', payload.companyId);

    // Fetch elimination journal entries with their lines
    const { data: entries, error: entriesError } = await supabaseAdmin
      .from('elimination_journal_entries')
      .select('*')
      .eq('company_id', payload.companyId)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (entriesError) {
      console.error('[API /elimination-entries GET] Error fetching entries:', entriesError);
      return NextResponse.json({ error: entriesError.message }, { status: 500 });
    }

    // For each entry, fetch its lines
    const entriesWithLines = await Promise.all(
      (entries || []).map(async (entry) => {
        const { data: lines, error: linesError } = await supabaseAdmin
          .from('elimination_journal_entry_lines')
          .select('*')
          .eq('entry_id', entry.id)
          .order('line_number');

        if (linesError) {
          console.error('[API /elimination-entries GET] Error fetching lines for entry', entry.id, linesError);
          return { ...entry, lines: [] };
        }

        return { ...entry, lines: lines || [] };
      })
    );

    console.log('[API /elimination-entries GET] Found', entriesWithLines?.length || 0, 'entries');
    return NextResponse.json(entriesWithLines || []);

  } catch (error) {
    console.error('Error in GET /api/elimination-entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new elimination entry with lines
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
    const { entry_name, entry_date, description, lines } = body;

    if (!entry_name || !entry_date || !lines || !Array.isArray(lines) || lines.length < 2) {
      return NextResponse.json({ error: 'Invalid entry data. Minimum 2 lines required.' }, { status: 400 });
    }

    // Verify all entities belong to user's company
    const entityIds = [...new Set(lines.map(l => l.entity_id))];
    const { data: entities } = await supabaseAdmin
      .from('entities')
      .select('id, company_id')
      .in('id', entityIds);

    const unauthorized = entities?.some(e => e.company_id !== payload.companyId);
    if (unauthorized || !entities || entities.length !== entityIds.length) {
      return NextResponse.json({ error: 'Unauthorized: One or more entities do not belong to your company' }, { status: 403 });
    }

    // Calculate totals
    let totalDebit = 0;
    let totalCredit = 0;
    lines.forEach(line => {
      totalDebit += parseFloat(line.debit || 0);
      totalCredit += parseFloat(line.credit || 0);
    });

    // Check if balanced
    const difference = Math.abs(totalDebit - totalCredit);
    if (difference > 0.01) {
      return NextResponse.json({
        error: `Entry is not balanced. Debit: ${totalDebit.toFixed(2)}, Credit: ${totalCredit.toFixed(2)}, Difference: ${difference.toFixed(2)}`
      }, { status: 400 });
    }

    console.log('[API /elimination-entries POST] Creating entry:', entry_name);

    // Create the entry
    const { data: entry, error: entryError} = await supabaseAdmin
      .from('elimination_journal_entries')
      .insert([{
        company_id: payload.companyId,
        entry_name,
        entry_date,
        description,
        total_debit: totalDebit,
        total_credit: totalCredit,
        is_posted: true,
        period: entry_date, // Use entry_date as period
        created_by: payload.userId
      }])
      .select()
      .single();

    if (entryError) {
      console.error('[API /elimination-entries POST] Error creating entry:', entryError);
      return NextResponse.json({ error: entryError.message }, { status: 500 });
    }

    console.log('[API /elimination-entries POST] Created entry:', entry.id);

    // Create the lines
    const lineRecords = lines.map((line, index) => ({
      entry_id: entry.id,
      entity_id: line.entity_id,
      gl_code: line.gl_code,
      gl_name: line.gl_name || '',
      debit: parseFloat(line.debit || 0),
      credit: parseFloat(line.credit || 0),
      line_number: index + 1
    }));

    const { data: createdLines, error: linesError } = await supabaseAdmin
      .from('elimination_journal_entry_lines')
      .insert(lineRecords)
      .select();

    if (linesError) {
      console.error('[API /elimination-entries POST] Error creating lines:', linesError);
      // Rollback entry
      await supabaseAdmin.from('elimination_journal_entries').delete().eq('id', entry.id);
      return NextResponse.json({ error: linesError.message }, { status: 500 });
    }

    console.log('[API /elimination-entries POST] Created', createdLines.length, 'lines');

    return NextResponse.json({
      ...entry,
      lines: createdLines
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/elimination-entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete an elimination entry and its lines
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Verify the entry belongs to user's company
    const { data: existingEntry } = await supabaseAdmin
      .from('elimination_journal_entries')
      .select('company_id')
      .eq('id', id)
      .single();

    if (!existingEntry || existingEntry.company_id !== payload.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('[API /elimination-entries DELETE] Deleting entry:', id);

    // Delete the entry (lines will be deleted via CASCADE)
    const { error } = await supabaseAdmin
      .from('elimination_journal_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[API /elimination-entries DELETE] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API /elimination-entries DELETE] Deleted entry:', id);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/elimination-entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
