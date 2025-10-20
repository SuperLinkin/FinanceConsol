import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';

/**
 * POST /api/cashflow/ai-generate
 * Calls Python service to generate cash flow using AI/ML
 */
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

    const { current_period, previous_period, use_ai, openai_api_key } = await request.json();

    if (!current_period || !previous_period) {
      return NextResponse.json(
        { error: 'current_period and previous_period are required' },
        { status: 400 }
      );
    }

    // Call Python service
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

    console.log(`🐍 Calling Python service at ${pythonServiceUrl}/api/cashflow/generate`);

    const response = await fetch(`${pythonServiceUrl}/api/cashflow/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_id: payload.companyId,
        current_period,
        previous_period,
        use_ai: use_ai !== false, // Default true
        openai_api_key: openai_api_key || undefined
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Python service error:', error);
      return NextResponse.json(
        { error: error.detail || 'Failed to generate cash flow' },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(`✅ Generated ${data.components?.length || 0} cash flow components`);

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in /api/cashflow/ai-generate:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
