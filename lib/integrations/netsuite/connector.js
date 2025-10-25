/**
 * NetSuite SuiteTalk REST API Connector
 *
 * Handles OAuth 1.0a authentication and data fetching from NetSuite
 * Supports: Trial Balance, Chart of Accounts, Subsidiaries, Exchange Rates
 */

import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import axios from 'axios';

export class NetSuiteConnector {
  constructor(config) {
    this.accountId = config.account_id; // e.g., "1234567"
    this.consumerKey = config.consumer_key;
    this.consumerSecret = config.consumer_secret;
    this.tokenId = config.token_id;
    this.tokenSecret = config.token_secret;
    this.realm = config.realm || 'production'; // 'production' or 'sandbox'

    // Base URL for NetSuite REST API
    this.baseUrl = `https://${this.accountId}.suitetalk.api.netsuite.com`;
    if (this.realm === 'sandbox') {
      this.baseUrl = `https://${this.accountId}-sb1.suitetalk.api.netsuite.com`;
    }

    // Initialize OAuth 1.0a
    this.oauth = new OAuth({
      consumer: {
        key: this.consumerKey,
        secret: this.consumerSecret,
      },
      signature_method: 'HMAC-SHA256',
      hash_function(base_string, key) {
        return crypto
          .createHmac('sha256', key)
          .update(base_string)
          .digest('base64');
      },
    });

    this.token = {
      key: this.tokenId,
      secret: this.tokenSecret,
    };
  }

  /**
   * Test connection to NetSuite
   */
  async testConnection() {
    try {
      // Try to fetch account info
      const response = await this.makeRequest('/services/rest/record/v1/account', 'GET', {
        limit: 1
      });

      return {
        success: true,
        message: 'Successfully connected to NetSuite',
        accountId: this.accountId,
        realm: this.realm,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to NetSuite',
        error: error.message
      };
    }
  }

  /**
   * Make authenticated request to NetSuite REST API
   */
  async makeRequest(endpoint, method = 'GET', params = {}, data = null) {
    const url = `${this.baseUrl}${endpoint}`;

    const requestData = {
      url,
      method,
    };

    // Add query parameters for GET requests
    if (method === 'GET' && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      requestData.url = `${url}?${queryString}`;
    }

    // Generate OAuth header
    const authHeader = this.oauth.toHeader(
      this.oauth.authorize(requestData, this.token)
    );

    const headers = {
      ...authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Prefer': 'transient',
    };

    try {
      const response = await axios({
        method,
        url: requestData.url,
        headers,
        data,
        timeout: 30000, // 30 second timeout
      });

      return response.data;
    } catch (error) {
      console.error('NetSuite API Error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message ||
        error.response?.data?.['o:errorDetails']?.[0]?.detail ||
        error.message
      );
    }
  }

  /**
   * Execute SuiteQL query (NetSuite's SQL-like query language)
   */
  async executeSuiteQL(query, params = {}) {
    try {
      const response = await this.makeRequest(
        '/services/rest/query/v1/suiteql',
        'POST',
        { limit: params.limit || 1000, offset: params.offset || 0 },
        { q: query }
      );

      return response.items || [];
    } catch (error) {
      console.error('SuiteQL Error:', error);
      throw error;
    }
  }

  /**
   * Fetch subsidiaries (entities)
   */
  async fetchSubsidiaries() {
    const query = `
      SELECT
        id,
        name,
        legalName,
        currency,
        fiscalCalendar,
        country,
        isInactive
      FROM subsidiary
      WHERE isInactive = 'F'
      ORDER BY name
    `;

    const subsidiaries = await this.executeSuiteQL(query);

    return subsidiaries.map(sub => ({
      netsuite_id: sub.id,
      code: sub.id,
      name: sub.name,
      legal_name: sub.legalname || sub.name,
      currency: sub.currency,
      country: sub.country,
      fiscal_calendar: sub.fiscalcalendar,
      is_active: !sub.isinactive
    }));
  }

  /**
   * Fetch Chart of Accounts
   */
  async fetchChartOfAccounts(subsidiaryId = null) {
    let query = `
      SELECT
        a.id,
        a.acctnumber,
        a.acctname,
        a.description,
        a.accttype,
        a.isInactive,
        a.isSummary,
        at.name as accountTypeName,
        a.parent
      FROM account a
      LEFT JOIN accountType at ON a.accttype = at.id
      WHERE a.isInactive = 'F'
    `;

    if (subsidiaryId) {
      query += ` AND a.subsidiary = ${subsidiaryId}`;
    }

    query += ` ORDER BY a.acctnumber`;

    const accounts = await this.executeSuiteQL(query);

    return accounts.map(account => ({
      netsuite_id: account.id,
      account_number: account.acctnumber,
      account_name: account.acctname,
      description: account.description,
      account_type: account.accounttypename || account.accttype,
      account_type_id: account.accttype,
      is_summary: account.issummary === 'T',
      parent_id: account.parent,
      is_active: account.isinactive === 'F'
    }));
  }

  /**
   * Fetch Trial Balance for a specific period and subsidiary
   *
   * @param {string} subsidiaryId - NetSuite subsidiary ID
   * @param {string} periodId - NetSuite accounting period ID
   * @param {object} options - Additional options (startDate, endDate)
   */
  async fetchTrialBalance(subsidiaryId, periodId, options = {}) {
    // NetSuite trial balance comes from General Ledger Detail
    // We'll use transaction search to build trial balance

    const { startDate, endDate } = options;

    let query = `
      SELECT
        tl.account as accountId,
        a.acctnumber as accountNumber,
        a.acctname as accountName,
        a.accttype as accountType,
        SUM(CASE WHEN tl.debit = 'T' THEN tl.amount ELSE 0 END) as totalDebit,
        SUM(CASE WHEN tl.credit = 'T' THEN tl.amount ELSE 0 END) as totalCredit,
        tl.subsidiary
      FROM transactionLine tl
      INNER JOIN account a ON tl.account = a.id
      INNER JOIN transaction t ON tl.transaction = t.id
      WHERE tl.subsidiary = ${subsidiaryId}
    `;

    if (periodId) {
      query += ` AND t.postingPeriod = ${periodId}`;
    }

    if (startDate && endDate) {
      query += ` AND t.trandate BETWEEN '${startDate}' AND '${endDate}'`;
    }

    query += `
      GROUP BY tl.account, a.acctnumber, a.acctname, a.accttype, tl.subsidiary
      HAVING (SUM(CASE WHEN tl.debit = 'T' THEN tl.amount ELSE 0 END) != 0
           OR SUM(CASE WHEN tl.credit = 'T' THEN tl.amount ELSE 0 END) != 0)
      ORDER BY a.acctnumber
    `;

    try {
      const results = await this.executeSuiteQL(query);

      return results.map(row => ({
        account_id: row.accountid,
        account_number: row.accountnumber,
        account_name: row.accountname,
        account_type: row.accounttype,
        debit: parseFloat(row.totaldebit || 0),
        credit: parseFloat(row.totalcredit || 0),
        net: parseFloat(row.totaldebit || 0) - parseFloat(row.totalcredit || 0),
        subsidiary_id: row.subsidiary
      }));
    } catch (error) {
      console.error('Error fetching trial balance:', error);
      throw error;
    }
  }

  /**
   * Fetch accounting periods
   */
  async fetchAccountingPeriods() {
    const query = `
      SELECT
        id,
        periodName,
        startDate,
        endDate,
        fiscalCalendar,
        isYear,
        isQuarter,
        isClosed,
        isAdjust
      FROM accountingPeriod
      WHERE isInactive = 'F'
      ORDER BY startDate DESC
      LIMIT 100
    `;

    const periods = await this.executeSuiteQL(query);

    return periods.map(period => ({
      netsuite_id: period.id,
      period_name: period.periodname,
      start_date: period.startdate,
      end_date: period.enddate,
      fiscal_calendar: period.fiscalcalendar,
      is_year: period.isyear === 'T',
      is_quarter: period.isquarter === 'T',
      is_closed: period.isclosed === 'T',
      is_adjustment: period.isadjust === 'T'
    }));
  }

  /**
   * Fetch exchange rates (currency exchange rates)
   */
  async fetchExchangeRates(startDate, endDate) {
    const query = `
      SELECT
        fromCurrency,
        toCurrency,
        exchangeRate,
        effectiveDate
      FROM consolidatedExchangeRate
      WHERE effectiveDate BETWEEN '${startDate}' AND '${endDate}'
      ORDER BY effectiveDate DESC, fromCurrency, toCurrency
    `;

    try {
      const rates = await this.executeSuiteQL(query);

      return rates.map(rate => ({
        from_currency: rate.fromcurrency,
        to_currency: rate.tocurrency,
        rate: parseFloat(rate.exchangerate),
        effective_date: rate.effectivedate
      }));
    } catch (error) {
      // Exchange rates might not be available in all NetSuite accounts
      console.warn('Exchange rates not available:', error.message);
      return [];
    }
  }

  /**
   * Get balance sheet accounts by type
   */
  async getBalanceSheetAccounts(subsidiaryId = null) {
    const balanceSheetTypes = [
      'Bank', 'AcctRec', 'OthCurrAsset', 'FixedAsset', 'OthAsset',
      'AcctPay', 'CredCard', 'OthCurrLiab', 'LongTermLiab',
      'Equity'
    ];

    let query = `
      SELECT
        a.id,
        a.acctnumber,
        a.acctname,
        at.name as accountType
      FROM account a
      LEFT JOIN accountType at ON a.accttype = at.id
      WHERE a.isInactive = 'F'
        AND at.name IN (${balanceSheetTypes.map(t => `'${t}'`).join(',')})
    `;

    if (subsidiaryId) {
      query += ` AND a.subsidiary = ${subsidiaryId}`;
    }

    query += ` ORDER BY a.acctnumber`;

    return await this.executeSuiteQL(query);
  }

  /**
   * Get income statement accounts
   */
  async getIncomeStatementAccounts(subsidiaryId = null) {
    const incomeStatementTypes = [
      'Income', 'COGS', 'Expense', 'OthIncome', 'OthExpense'
    ];

    let query = `
      SELECT
        a.id,
        a.acctnumber,
        a.acctname,
        at.name as accountType
      FROM account a
      LEFT JOIN accountType at ON a.accttype = at.id
      WHERE a.isInactive = 'F'
        AND at.name IN (${incomeStatementTypes.map(t => `'${t}'`).join(',')})
    `;

    if (subsidiaryId) {
      query += ` AND a.subsidiary = ${subsidiaryId}`;
    }

    query += ` ORDER BY a.acctnumber`;

    return await this.executeSuiteQL(query);
  }

  /**
   * Sync full financial data (subsidiaries, COA, trial balance, periods)
   */
  async syncFullFinancialData(options = {}) {
    const results = {
      subsidiaries: [],
      chart_of_accounts: [],
      trial_balances: [],
      periods: [],
      exchange_rates: [],
      errors: []
    };

    try {
      // 1. Fetch subsidiaries
      console.log('Fetching subsidiaries...');
      results.subsidiaries = await this.fetchSubsidiaries();

      // 2. Fetch accounting periods
      console.log('Fetching accounting periods...');
      results.periods = await this.fetchAccountingPeriods();

      // 3. Fetch chart of accounts
      console.log('Fetching chart of accounts...');
      results.chart_of_accounts = await this.fetchChartOfAccounts();

      // 4. Fetch trial balance for each subsidiary and specified period
      if (options.subsidiaryId && options.periodId) {
        console.log(`Fetching trial balance for subsidiary ${options.subsidiaryId}, period ${options.periodId}...`);
        const trialBalance = await this.fetchTrialBalance(
          options.subsidiaryId,
          options.periodId,
          {
            startDate: options.startDate,
            endDate: options.endDate
          }
        );
        results.trial_balances.push({
          subsidiary_id: options.subsidiaryId,
          period_id: options.periodId,
          data: trialBalance
        });
      }

      // 5. Fetch exchange rates if date range provided
      if (options.startDate && options.endDate) {
        console.log('Fetching exchange rates...');
        results.exchange_rates = await this.fetchExchangeRates(
          options.startDate,
          options.endDate
        );
      }

      return results;

    } catch (error) {
      console.error('Error syncing NetSuite data:', error);
      results.errors.push({
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Map NetSuite account type to IFRS classification
   */
  static mapAccountTypeToIFRS(netsuiteAccountType) {
    const mapping = {
      // Assets
      'Bank': 'Assets',
      'AcctRec': 'Assets',
      'OthCurrAsset': 'Assets',
      'FixedAsset': 'Assets',
      'OthAsset': 'Assets',

      // Liabilities
      'AcctPay': 'Liability',
      'CredCard': 'Liability',
      'OthCurrLiab': 'Liability',
      'LongTermLiab': 'Liability',

      // Equity
      'Equity': 'Equity',

      // Revenue
      'Income': 'Revenue',
      'OthIncome': 'Revenue',

      // Expenses
      'COGS': 'Expenses',
      'Expense': 'Expenses',
      'OthExpense': 'Expenses'
    };

    return mapping[netsuiteAccountType] || 'Assets';
  }

  /**
   * Map NetSuite account to COA sub-class
   */
  static mapAccountToSubClass(netsuiteAccountType) {
    const mapping = {
      'Bank': 'Cash and Cash Equivalents',
      'AcctRec': 'Trade Receivables',
      'OthCurrAsset': 'Other Current Assets',
      'FixedAsset': 'Property, Plant and Equipment',
      'OthAsset': 'Other Non-Current Assets',

      'AcctPay': 'Trade Payables',
      'CredCard': 'Other Current Liabilities',
      'OthCurrLiab': 'Other Current Liabilities',
      'LongTermLiab': 'Long-term Borrowings',

      'Equity': 'Share Capital',

      'Income': 'Revenue from Operations',
      'OthIncome': 'Other Income',

      'COGS': 'Cost of Sales',
      'Expense': 'Operating Expenses',
      'OthExpense': 'Other Expenses'
    };

    return mapping[netsuiteAccountType] || 'Other';
  }
}

export default NetSuiteConnector;
