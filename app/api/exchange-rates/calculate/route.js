import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { errorResponse, successResponse } from '@/lib/errorHandler';

/**
 * POST /api/exchange-rates/calculate
 * Fetches and calculates closing and average exchange rates for a given period
 */
export async function POST(request) {
  return requireAuth(request, async (req, user) => {
    try {
      const { from_currency, to_currency, period } = await req.json();

      if (!from_currency || !to_currency || !period) {
        return NextResponse.json(
          { error: 'from_currency, to_currency, and period are required' },
          { status: 400 }
        );
      }

      // Parse period to determine start and end dates
      // Supported formats: "2024-12", "Dec-2024", "Q4-2024", "2024"
      const { startDate, endDate } = parsePeriod(period);

      console.log(`📅 Calculating rates for ${from_currency} → ${to_currency}`);
      console.log(`   Period: ${period} (${startDate} to ${endDate})`);

      // Fetch closing rate (rate on the last day of the period)
      const closingRateResponse = await fetch(
        `https://api.frankfurter.app/${endDate}?from=${from_currency}&to=${to_currency}`
      );

      if (!closingRateResponse.ok) {
        throw new Error('Failed to fetch closing rate');
      }

      const closingData = await closingRateResponse.json();
      const closingRate = closingData.rates?.[to_currency] || null;

      // Fetch time series for average rate calculation
      const timeSeriesResponse = await fetch(
        `https://api.frankfurter.app/${startDate}..${endDate}?from=${from_currency}&to=${to_currency}`
      );

      if (!timeSeriesResponse.ok) {
        throw new Error('Failed to fetch time series data');
      }

      const timeSeriesData = await timeSeriesResponse.json();
      const rates = timeSeriesData.rates || {};

      // Calculate average rate
      let averageRate = null;
      if (Object.keys(rates).length > 0) {
        const rateValues = Object.values(rates).map(r => r[to_currency]).filter(r => r != null);
        if (rateValues.length > 0) {
          const sum = rateValues.reduce((acc, val) => acc + val, 0);
          averageRate = sum / rateValues.length;
        }
      }

      console.log(`💱 Closing Rate: ${closingRate?.toFixed(4) || 'N/A'}`);
      console.log(`📊 Average Rate: ${averageRate?.toFixed(4) || 'N/A'} (based on ${Object.keys(rates).length} days)`);

      return successResponse({
        success: true,
        data: {
          from_currency,
          to_currency,
          period,
          start_date: startDate,
          end_date: endDate,
          closing_rate: closingRate,
          average_rate: averageRate,
          days_count: Object.keys(rates).length,
          calculated_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error calculating exchange rates:', error);
      return errorResponse(error);
    }
  });
}

/**
 * Parse period string to extract start and end dates
 * Supports formats: "2024-12", "Dec-2024", "Q4-2024", "2024"
 */
function parsePeriod(period) {
  // Format: "2024-12" or "12-2024"
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [year, month] = period.split('-');
    const startDate = `${year}-${month}-01`;
    const endDate = getLastDayOfMonth(parseInt(year), parseInt(month));
    return { startDate, endDate };
  }

  // Format: "Dec-2024" or "2024-Dec"
  const monthMatch = period.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-?(\d{4})|(\d{4})-?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
  if (monthMatch) {
    const monthStr = monthMatch[1] || monthMatch[4];
    const year = monthMatch[2] || monthMatch[3];
    const month = getMonthNumber(monthStr);
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = getLastDayOfMonth(parseInt(year), month);
    return { startDate, endDate };
  }

  // Format: "Q1-2024", "Q2-2024", etc.
  const quarterMatch = period.match(/Q([1-4])-?(\d{4})|(\d{4})-?Q([1-4])/i);
  if (quarterMatch) {
    const quarter = parseInt(quarterMatch[1] || quarterMatch[4]);
    const year = quarterMatch[2] || quarterMatch[3];
    const { startMonth, endMonth } = getQuarterMonths(quarter);
    const startDate = `${year}-${startMonth.toString().padStart(2, '0')}-01`;
    const endDate = getLastDayOfMonth(parseInt(year), endMonth);
    return { startDate, endDate };
  }

  // Format: "2024" (full year)
  if (/^\d{4}$/.test(period)) {
    const startDate = `${period}-01-01`;
    const endDate = `${period}-12-31`;
    return { startDate, endDate };
  }

  // Default: assume it's already in YYYY-MM-DD format or use current month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = getLastDayOfMonth(year, month);
  return { startDate, endDate };
}

function getLastDayOfMonth(year, month) {
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
}

function getMonthNumber(monthStr) {
  const months = {
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
  };
  return months[monthStr.toLowerCase()] || 1;
}

function getQuarterMonths(quarter) {
  const quarters = {
    1: { startMonth: 1, endMonth: 3 },
    2: { startMonth: 4, endMonth: 6 },
    3: { startMonth: 7, endMonth: 9 },
    4: { startMonth: 10, endMonth: 12 }
  };
  return quarters[quarter] || { startMonth: 1, endMonth: 3 };
}
