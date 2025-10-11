import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { errorResponse, successResponse } from '@/lib/errorHandler';

/**
 * GET /api/exchange-rates
 * Fetches live exchange rates from open-source API
 */
export async function GET(request) {
  return requireAuth(request, async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const baseCurrency = searchParams.get('base') || 'USD';

      // Validate currency code
      if (!/^[A-Z]{3}$/.test(baseCurrency)) {
        return NextResponse.json(
          { error: 'Invalid currency code' },
          { status: 400 }
        );
      }

      // Using Frankfurter API (free, open-source, no API key required)
      const response = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}`);

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();

      return successResponse({
        success: true,
        data: {
          base: data.base,
          date: data.date,
          rates: data.rates,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      return errorResponse(error);
    }
  });
}

/**
 * POST /api/exchange-rates/update
 * Updates exchange rates for all active currencies in the database
 */
export async function POST(request) {
  return requireAuth(request, async (req, user) => {
    try {
      const { baseCurrency = 'USD', currencies } = await req.json();

      // Validate inputs
      if (!/^[A-Z]{3}$/.test(baseCurrency)) {
        return NextResponse.json(
          { error: 'Invalid base currency code' },
          { status: 400 }
        );
      }

      // Fetch rates from API
      const response = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}`);

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();

      // Return rates for requested currencies
      const updatedRates = {};
      if (currencies && Array.isArray(currencies)) {
        currencies.forEach(curr => {
          if (data.rates[curr]) {
            updatedRates[curr] = data.rates[curr];
          }
        });
      }

      return successResponse({
        success: true,
        base: data.base,
        date: data.date,
        rates: Object.keys(updatedRates).length > 0 ? updatedRates : data.rates,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      return errorResponse(error);
    }
  });
}
