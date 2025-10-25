/**
 * NetSuite Sync Service
 *
 * Handles synchronization of NetSuite data into the application database
 * Manages: Trial Balance, Chart of Accounts, Entities, Exchange Rates
 */

import { NetSuiteConnector } from './connector.js';
import { createClient } from '@supabase/supabase-js';

export class NetSuiteSyncService {
  constructor(integration, supabaseClient) {
    this.integration = integration;
    this.supabase = supabaseClient;
    this.companyId = integration.company_id;

    // Initialize NetSuite connector
    const config = {
      account_id: integration.connection_config.account_id,
      consumer_key: integration.credentials.consumer_key,
      consumer_secret: integration.credentials.consumer_secret,
      token_id: integration.credentials.token_id,
      token_secret: integration.credentials.token_secret,
      realm: integration.connection_config.realm || 'production'
    };

    this.connector = new NetSuiteConnector(config);
    this.logs = [];
  }

  /**
   * Log sync operation
   */
  log(level, message, data = null) {
    const logEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    this.logs.push(logEntry);
    console.log(`[${level.toUpperCase()}] ${message}`, data || '');
  }

  /**
   * Save logs to database
   */
  async saveLogs(syncHistoryId) {
    if (this.logs.length === 0) return;

    const logsToInsert = this.logs.map(log => ({
      integration_id: this.integration.id,
      sync_history_id: syncHistoryId,
      company_id: this.companyId,
      log_level: log.level,
      log_message: log.message,
      log_data: log.data,
      created_at: log.timestamp
    }));

    await this.supabase
      .from('integration_logs')
      .insert(logsToInsert);
  }

  /**
   * Sync subsidiaries (entities) from NetSuite
   */
  async syncSubsidiaries(entityMapping = {}) {
    this.log('info', 'Starting subsidiary sync from NetSuite');

    try {
      const subsidiaries = await this.connector.fetchSubsidiaries();
      this.log('info', `Fetched ${subsidiaries.length} subsidiaries from NetSuite`);

      let syncedCount = 0;
      let skippedCount = 0;

      for (const sub of subsidiaries) {
        // Check if entity mapping exists
        const mappedEntityId = entityMapping[sub.netsuite_id];

        if (mappedEntityId) {
          // Update existing entity with NetSuite data
          const { error } = await this.supabase
            .from('entities')
            .update({
              entity_name: sub.name,
              functional_currency: sub.currency,
              updated_at: new Date().toISOString()
            })
            .eq('id', mappedEntityId)
            .eq('company_id', this.companyId);

          if (error) {
            this.log('error', `Error updating entity ${sub.name}`, error);
          } else {
            syncedCount++;
            this.log('debug', `Updated entity: ${sub.name}`);
          }
        } else {
          // Optionally create new entity (or skip)
          skippedCount++;
          this.log('warning', `No mapping found for NetSuite subsidiary: ${sub.name} (ID: ${sub.netsuite_id})`);
        }
      }

      return {
        total: subsidiaries.length,
        synced: syncedCount,
        skipped: skippedCount,
        subsidiaries
      };

    } catch (error) {
      this.log('error', 'Error syncing subsidiaries', error.message);
      throw error;
    }
  }

  /**
   * Sync Chart of Accounts from NetSuite
   */
  async syncChartOfAccounts(subsidiaryId = null) {
    this.log('info', 'Starting chart of accounts sync from NetSuite', { subsidiaryId });

    try {
      const accounts = await this.connector.fetchChartOfAccounts(subsidiaryId);
      this.log('info', `Fetched ${accounts.length} accounts from NetSuite`);

      let importedCount = 0;
      let updatedCount = 0;
      let errorCount = 0;

      for (const account of accounts) {
        try {
          // Map NetSuite account type to IFRS class
          const ifrsClass = NetSuiteConnector.mapAccountTypeToIFRS(account.account_type);
          const subClass = NetSuiteConnector.mapAccountToSubClass(account.account_type);

          // Check if account already exists
          const { data: existing } = await this.supabase
            .from('chart_of_accounts')
            .select('id')
            .eq('company_id', this.companyId)
            .eq('account_code', account.account_number)
            .single();

          const accountData = {
            company_id: this.companyId,
            account_code: account.account_number,
            account_name: account.account_name,
            class_name: ifrsClass,
            subclass_name: subClass,
            description: account.description,
            is_active: account.is_active,
            gl_code: account.account_number,
            gl_name: account.account_name,
            // Store NetSuite metadata
            netsuite_id: account.netsuite_id,
            netsuite_account_type: account.account_type,
            // Entity can be null for company-wide accounts
            entity_id: null
          };

          if (existing) {
            // Update existing account
            const { error } = await this.supabase
              .from('chart_of_accounts')
              .update(accountData)
              .eq('id', existing.id);

            if (error) {
              this.log('error', `Error updating account ${account.account_number}`, error);
              errorCount++;
            } else {
              updatedCount++;
            }
          } else {
            // Insert new account
            const { error } = await this.supabase
              .from('chart_of_accounts')
              .insert(accountData);

            if (error) {
              this.log('error', `Error inserting account ${account.account_number}`, error);
              errorCount++;
            } else {
              importedCount++;
            }
          }
        } catch (error) {
          this.log('error', `Error processing account ${account.account_number}`, error.message);
          errorCount++;
        }
      }

      return {
        total: accounts.length,
        imported: importedCount,
        updated: updatedCount,
        errors: errorCount
      };

    } catch (error) {
      this.log('error', 'Error syncing chart of accounts', error.message);
      throw error;
    }
  }

  /**
   * Sync Trial Balance from NetSuite
   */
  async syncTrialBalance(subsidiaryId, periodId, options = {}) {
    this.log('info', 'Starting trial balance sync from NetSuite', {
      subsidiaryId,
      periodId,
      ...options
    });

    try {
      const trialBalanceData = await this.connector.fetchTrialBalance(
        subsidiaryId,
        periodId,
        options
      );

      this.log('info', `Fetched ${trialBalanceData.length} trial balance entries from NetSuite`);

      // Get entity mapping for this subsidiary
      const entityId = this.integration.entity_mapping?.[subsidiaryId];

      if (!entityId) {
        throw new Error(`No entity mapping found for NetSuite subsidiary ${subsidiaryId}`);
      }

      // Get period name for mapping
      const periodName = options.periodName || `${options.startDate}_${options.endDate}`;

      // Delete existing trial balance for this entity/period
      await this.supabase
        .from('trial_balance')
        .delete()
        .eq('company_id', this.companyId)
        .eq('entity_id', entityId)
        .eq('period', periodName);

      this.log('info', 'Deleted existing trial balance data for the period');

      let importedCount = 0;
      let errorCount = 0;

      for (const tb of trialBalanceData) {
        try {
          // Find matching GL code in our COA
          const { data: coaAccount } = await this.supabase
            .from('chart_of_accounts')
            .select('id, class_name, subclass_name')
            .eq('company_id', this.companyId)
            .eq('account_code', tb.account_number)
            .single();

          if (!coaAccount) {
            this.log('warning', `GL code ${tb.account_number} not found in COA, skipping`);
            continue;
          }

          // Insert trial balance entry
          const { error } = await this.supabase
            .from('trial_balance')
            .insert({
              company_id: this.companyId,
              entity_id: entityId,
              period: periodName,
              account_code: tb.account_number,
              account_name: tb.account_name,
              debit: tb.debit,
              credit: tb.credit,
              class: coaAccount.class_name,
              sub_class: coaAccount.subclass_name,
              gl_code: tb.account_number,
              gl_name: tb.account_name,
              // Store NetSuite metadata
              netsuite_account_id: tb.account_id,
              netsuite_subsidiary_id: tb.subsidiary_id
            });

          if (error) {
            this.log('error', `Error inserting TB entry for ${tb.account_number}`, error);
            errorCount++;
          } else {
            importedCount++;
          }
        } catch (error) {
          this.log('error', `Error processing TB entry ${tb.account_number}`, error.message);
          errorCount++;
        }
      }

      return {
        total: trialBalanceData.length,
        imported: importedCount,
        errors: errorCount,
        entity_id: entityId,
        period: periodName
      };

    } catch (error) {
      this.log('error', 'Error syncing trial balance', error.message);
      throw error;
    }
  }

  /**
   * Sync Exchange Rates from NetSuite
   */
  async syncExchangeRates(startDate, endDate) {
    this.log('info', 'Starting exchange rates sync from NetSuite', { startDate, endDate });

    try {
      const rates = await this.connector.fetchExchangeRates(startDate, endDate);

      if (rates.length === 0) {
        this.log('warning', 'No exchange rates found in NetSuite for the specified period');
        return { total: 0, imported: 0, updated: 0 };
      }

      this.log('info', `Fetched ${rates.length} exchange rates from NetSuite`);

      let importedCount = 0;
      let updatedCount = 0;

      for (const rate of rates) {
        try {
          // Check if rate already exists
          const { data: existing } = await this.supabase
            .from('exchange_rates')
            .select('id')
            .eq('from_currency', rate.from_currency)
            .eq('to_currency', rate.to_currency)
            .eq('rate_date', rate.effective_date)
            .eq('rate_type', 'Spot')
            .single();

          const rateData = {
            from_currency: rate.from_currency,
            to_currency: rate.to_currency,
            rate: rate.rate,
            rate_date: rate.effective_date,
            rate_type: 'Spot',
            source: 'NetSuite'
          };

          if (existing) {
            // Update existing rate
            await this.supabase
              .from('exchange_rates')
              .update(rateData)
              .eq('id', existing.id);
            updatedCount++;
          } else {
            // Insert new rate
            await this.supabase
              .from('exchange_rates')
              .insert(rateData);
            importedCount++;
          }
        } catch (error) {
          this.log('error', `Error processing exchange rate ${rate.from_currency}/${rate.to_currency}`, error.message);
        }
      }

      return {
        total: rates.length,
        imported: importedCount,
        updated: updatedCount
      };

    } catch (error) {
      this.log('error', 'Error syncing exchange rates', error.message);
      // Don't throw - exchange rates are optional
      return { total: 0, imported: 0, updated: 0, error: error.message };
    }
  }

  /**
   * Execute full sync based on integration settings
   */
  async executeFullSync(options = {}) {
    const results = {
      subsidiaries: null,
      chart_of_accounts: null,
      trial_balance: null,
      exchange_rates: null,
      start_time: new Date().toISOString(),
      end_time: null,
      duration_seconds: 0
    };

    const startTime = Date.now();

    try {
      // Sync subsidiaries if enabled
      if (this.integration.sync_entities) {
        this.log('info', 'Syncing subsidiaries...');
        results.subsidiaries = await this.syncSubsidiaries(
          this.integration.entity_mapping || {}
        );
      }

      // Sync chart of accounts if enabled
      if (this.integration.sync_chart_of_accounts) {
        this.log('info', 'Syncing chart of accounts...');
        results.chart_of_accounts = await this.syncChartOfAccounts(
          options.subsidiaryId
        );
      }

      // Sync trial balance if enabled
      if (this.integration.sync_trial_balance && options.subsidiaryId && options.periodId) {
        this.log('info', 'Syncing trial balance...');
        results.trial_balance = await this.syncTrialBalance(
          options.subsidiaryId,
          options.periodId,
          {
            startDate: options.startDate,
            endDate: options.endDate,
            periodName: options.periodName
          }
        );
      }

      // Sync exchange rates if enabled
      if (this.integration.sync_exchange_rates && options.startDate && options.endDate) {
        this.log('info', 'Syncing exchange rates...');
        results.exchange_rates = await this.syncExchangeRates(
          options.startDate,
          options.endDate
        );
      }

      const endTime = Date.now();
      results.end_time = new Date().toISOString();
      results.duration_seconds = Math.floor((endTime - startTime) / 1000);

      this.log('info', 'Full sync completed successfully', results);

      return results;

    } catch (error) {
      const endTime = Date.now();
      results.end_time = new Date().toISOString();
      results.duration_seconds = Math.floor((endTime - startTime) / 1000);
      results.error = error.message;

      this.log('error', 'Full sync failed', error.message);
      throw error;
    }
  }

  /**
   * Get total records count for summary
   */
  getTotalRecords(results) {
    let total = 0;

    if (results.subsidiaries) total += results.subsidiaries.total || 0;
    if (results.chart_of_accounts) total += results.chart_of_accounts.total || 0;
    if (results.trial_balance) total += results.trial_balance.total || 0;
    if (results.exchange_rates) total += results.exchange_rates.total || 0;

    return total;
  }

  /**
   * Get imported records count for summary
   */
  getImportedRecords(results) {
    let imported = 0;

    if (results.subsidiaries) imported += results.subsidiaries.synced || 0;
    if (results.chart_of_accounts) {
      imported += (results.chart_of_accounts.imported || 0) +
                  (results.chart_of_accounts.updated || 0);
    }
    if (results.trial_balance) imported += results.trial_balance.imported || 0;
    if (results.exchange_rates) {
      imported += (results.exchange_rates.imported || 0) +
                  (results.exchange_rates.updated || 0);
    }

    return imported;
  }
}

export default NetSuiteSyncService;
