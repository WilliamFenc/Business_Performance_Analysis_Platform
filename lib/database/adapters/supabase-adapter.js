/**
 * Supabase 資料庫適配器
 * 包裝 Supabase SDK 查詢邏輯
 */
import { convertToMillions } from '../../../lib/_lib.js';
import { getSupabaseClient } from '../../../api/_lib.js';

export class SupabaseAdapter {
  constructor() {
    this.client = getSupabaseClient();
    this.type = 'supabase';
  }

  async getCompanies() {
    const { data, error } = await this.client
      .from('companies')
      .select('id, company_name')
      .order('company_name');

    if (error) throw error;

    return data.map(row => ({
      id: row.id,
      name: row.company_name,
    }));
  }

  async getFinancialBasics(filters = {}) {
    let query = this.client
      .from('financial_basics')
      .select('*')
      .order('fiscal_year', { ascending: false })
      .order('tax_id', { ascending: true });

    if (filters.taxId) query = query.eq('tax_id', filters.taxId);
    if (filters.fiscalYear) query = query.eq('fiscal_year', filters.fiscalYear);
    if (filters.companyName) query = query.eq('company_name', filters.companyName);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async upsertFinancialBasics(data) {
    const { data: result, error } = await this.client
      .from('financial_basics')
      .upsert(data, {
        onConflict: 'fiscal_year,tax_id',
        ignoreDuplicates: false
      })
      .select();

    if (error) throw error;
    return result?.[0] || null;
  }

  async updateFinancialBasics(taxId, year, data) {
    // 移除主鍵欄位
    const { fiscal_year, tax_id, ...updateData } = data;

    const { data: result, error } = await this.client
      .from('financial_basics')
      .update(updateData)
      .eq('tax_id', taxId)
      .eq('fiscal_year', year)
      .select();

    if (error) throw error;

    if (!result || result.length === 0) {
      throw new Error('找不到指定的財務報表資料');
    }

    return result[0];
  }

  async deleteFinancialBasics(taxId, year) {
    // 先查詢資料是否存在
    const { data: existingData } = await this.client
      .from('financial_basics')
      .select('*')
      .eq('tax_id', taxId)
      .eq('fiscal_year', year)
      .maybeSingle();

    if (!existingData) {
      throw new Error('找不到指定的財務報表資料');
    }

    const { error } = await this.client
      .from('financial_basics')
      .delete()
      .eq('tax_id', taxId)
      .eq('fiscal_year', year);

    if (error) throw error;

    return existingData;
  }

  async getPlIncome(filters = {}) {
    let query = this.client
      .from('pl_income_basics')
      .select('*')
      .order('fiscal_year', { ascending: false })
      .order('tax_id', { ascending: true });

    if (filters.taxId) query = query.eq('tax_id', filters.taxId);
    if (filters.fiscalYear) query = query.eq('fiscal_year', filters.fiscalYear);
    if (filters.companyName) query = query.eq('company_name', filters.companyName);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async upsertPlIncome(data) {
    const { data: result, error } = await this.client
      .from('pl_income_basics')
      .upsert(data, {
        onConflict: 'fiscal_year,tax_id',
        ignoreDuplicates: false
      })
      .select();

    if (error) throw error;
    return result?.[0] || null;
  }

  async updatePlIncome(taxId, year, data) {
    // 移除主鍵欄位
    const { fiscal_year, tax_id, ...updateData } = data;

    const { data: result, error } = await this.client
      .from('pl_income_basics')
      .update(updateData)
      .eq('tax_id', taxId)
      .eq('fiscal_year', year)
      .select();

    if (error) throw error;

    if (!result || result.length === 0) {
      throw new Error('找不到指定的損益表資料');
    }

    return result[0];
  }

  async deletePlIncome(taxId, year) {
    // 先查詢資料是否存在
    const { data: existingData } = await this.client
      .from('pl_income_basics')
      .select('*')
      .eq('tax_id', taxId)
      .eq('fiscal_year', year)
      .maybeSingle();

    if (!existingData) {
      throw new Error('找不到指定的損益表資料');
    }

    const { error } = await this.client
      .from('pl_income_basics')
      .delete()
      .eq('tax_id', taxId)
      .eq('fiscal_year', year);

    if (error) throw error;

    return existingData;
  }

  async getFinancialDataByCompany(company) {
    const { data, error } = await this.client
      .from('pl_income_basics')
      .select('fiscal_year, operating_revenue_total, profit_before_tax')
      .eq('company_name', company)
      .order('fiscal_year');

    if (error) throw error;

    return {
      company: company,
      data: {
        labels: data.map(row => String(row.fiscal_year)),
        revenue: data.map(row => convertToMillions(row.operating_revenue_total)),
        profit: data.map(row => convertToMillions(row.profit_before_tax)),
      }
    };
  }

  async getPlIncomeByCompany(company) {
    const { data, error } = await this.client
      .from('pl_income_basics')
      .select('*')
      .eq('company_name', company)
      .order('fiscal_year');

    if (error) throw error;
    return data || [];
  }

  async getFinancialBasicsByCompany(company) {
    const { data, error } = await this.client
      .from('financial_basics')
      .select('*')
      .eq('company_name', company)
      .order('fiscal_year');

    if (error) throw error;
    return data || [];
  }

  async getFinancialBasicsByTaxIdAndYear(taxId, year) {
    const { data, error } = await this.client
      .from('financial_basics')
      .select('*')
      .eq('tax_id', taxId)
      .eq('fiscal_year', year)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getPlIncomeByTaxIdAndYear(taxId, year) {
    const { data, error } = await this.client
      .from('pl_income_basics')
      .select('*')
      .eq('tax_id', taxId)
      .eq('fiscal_year', year)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getExportData() {
    const { data, error } = await this.client
      .from('pl_income_basics')
      .select(`
        fiscal_year,
        operating_revenue_total,
        profit_before_tax,
        companies!inner (
          company_name
        )
      `)
      .order('fiscal_year');

    if (error) throw error;
    return data;
  }

  async batchUpsertFinancialBasics(records) {
    const results = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      // 驗證必要欄位
      if (!record.fiscal_year || !record.tax_id) {
        results.skipped++;
        results.errors.push({
          row: i + 1,
          reason: '缺少必填欄位 fiscal_year 或 tax_id'
        });
        continue;
      }

      // 檢查是否為新增或更新
      const { data: existing } = await this.client
        .from('financial_basics')
        .select('fiscal_year, tax_id')
        .eq('fiscal_year', record.fiscal_year)
        .eq('tax_id', record.tax_id)
        .maybeSingle();

      const isUpdate = !!existing;

      // 執行 upsert
      const { data: upsertData, error: upsertError } = await this.client
        .from('financial_basics')
        .upsert(record, {
          onConflict: 'fiscal_year,tax_id',
          ignoreDuplicates: false
        })
        .select();

      if (upsertError) {
        results.skipped++;
        results.errors.push({
          row: i + 1,
          reason: upsertError.message
        });
        continue;
      }

      if (isUpdate) {
        results.updated++;
      } else {
        results.inserted++;
      }
    }

    return results;
  }

  async batchUpsertPlIncome(records) {
    const results = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      // 驗證必要欄位
      if (!record.fiscal_year || !record.tax_id) {
        results.skipped++;
        results.errors.push({
          row: i + 1,
          reason: '缺少必填欄位 fiscal_year 或 tax_id'
        });
        continue;
      }

      // 檢查是否為新增或更新
      const { data: existing } = await this.client
        .from('pl_income_basics')
        .select('fiscal_year, tax_id')
        .eq('fiscal_year', record.fiscal_year)
        .eq('tax_id', record.tax_id)
        .maybeSingle();

      const isUpdate = !!existing;

      // 執行 upsert
      const { data: upsertData, error: upsertError } = await this.client
        .from('pl_income_basics')
        .upsert(record, {
          onConflict: 'fiscal_year,tax_id',
          ignoreDuplicates: false
        })
        .select();

      if (upsertError) {
        results.skipped++;
        results.errors.push({
          row: i + 1,
          reason: upsertError.message
        });
        continue;
      }

      if (isUpdate) {
        results.updated++;
      } else {
        results.inserted++;
      }
    }

    return results;
  }

  async getAllFinancialDataWithCompany() {
    const { data, error } = await this.client
      .from('pl_income_basics')
      .select(`
        fiscal_year,
        operating_revenue_total,
        profit_before_tax,
        companies!inner (
          id,
          company_name
        )
      `);

    if (error) throw error;

    return data.map(row => ({
      company_id: row.companies?.id,
      company: row.companies?.company_name || '未知公司',
      year: row.fiscal_year,
      revenue: convertToMillions(row.operating_revenue_total),
      profit: convertToMillions(row.profit_before_tax),
    })).sort((a, b) => a.company.localeCompare(b.company) || b.year - a.year);
  }

  async getDatabaseStatus() {
    try {
      // 測試查詢
      const { data, error } = await this.client
        .from('companies')
        .select('id')
        .limit(1);

      if (error) throw error;

      return {
        databaseType: 'supabase',
        status: 'connected',
        message: '已連接至 Supabase'
      };
    } catch (error) {
      return {
        databaseType: 'supabase',
        status: 'failed',
        message: `連線失敗: ${error.message}`
      };
    }
  }
}
