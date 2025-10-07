import { NextResponse } from 'next/server';

/**
 * GET /api/exchange-rates
 * Fetches live exchange rates from open-source API
 * Uses exchangerate-api.com (free, no API key required for basic usage)
 * Alternative: Use ECB (European Central Bank) API
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const baseCurrency = searchParams.get('base') || 'USD';

    // Using exchangerate-api.com free API
    // Alternative APIs:
    // 1. ECB: https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml
    // 2. Frankfurter: https://www.frankfurter.app/latest
    // 3. Open Exchange Rates: https://openexchangerates.org/api/latest.json

    // Using Frankfurter API (free, open-source, no API key required)
    const response = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}`);

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();

    // Format response
    const rates = {
      base: data.base,
      date: data.date,
      rates: data.rates,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: rates
    });

  } catch (error) {
    console.error('Exchange rate fetch error:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      fallback: true,
      data: {
        base: 'USD',
        date: new Date().toISOString().split('T')[0],
        rates: {},
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

/**
 * POST /api/exchange-rates/update
 * Updates exchange rates for all active currencies in the database
 */
export async function POST(request) {
  try {
    const { baseCurrency = 'USD', currencies } = await request.json();

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

    return NextResponse.json({
      success: true,
      base: data.base,
      date: data.date,
      rates: updatedRates,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Exchange rate update error:', error);

    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
