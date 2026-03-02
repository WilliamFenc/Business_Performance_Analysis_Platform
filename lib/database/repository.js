/**
 * 資料庫 Repository 介面
 * 提供統一的資料庫操作介面，支援 Supabase 和 SQL Server
 */

// 資料庫型別常數
export const DATABASE_TYPE = {
  SUPABASE: 'supabase',
  SQLSERVER: 'sqlserver'
};

// 取得目前使用的資料庫型別
export function getDatabaseType() {
  return process.env.DATABASE_TYPE || DATABASE_TYPE.SUPABASE;
}

// 取得資料庫適配器（根據環境變數自動選擇）
export async function getDatabaseAdapter() {
  const type = getDatabaseType();

  if (type === DATABASE_TYPE.SQLSERVER) {
    const { SqlServerAdapter } = await import('./adapters/sqlserver-adapter.js');
    return new SqlServerAdapter();
  }

  // 預設使用 Supabase
  const { SupabaseAdapter } = await import('./adapters/supabase-adapter.js');
  return new SupabaseAdapter();
}

/**
 * BaseRepository 類別
 * 提供所有資料庫操作的基本介面
 */
export class BaseRepository {
  constructor(adapter) {
    this.adapter = adapter;
  }

  // 公司操作
  async getCompanies() {
    return this.adapter.getCompanies();
  }

  // 財務報表操作
  async getFinancialBasics(filters = {}) {
    return this.adapter.getFinancialBasics(filters);
  }

  async upsertFinancialBasics(data) {
    return this.adapter.upsertFinancialBasics(data);
  }

  async updateFinancialBasics(taxId, year, data) {
    return this.adapter.updateFinancialBasics(taxId, year, data);
  }

  async deleteFinancialBasics(taxId, year) {
    return this.adapter.deleteFinancialBasics(taxId, year);
  }

  // 損益表操作
  async getPlIncome(filters = {}) {
    return this.adapter.getPlIncome(filters);
  }

  async upsertPlIncome(data) {
    return this.adapter.upsertPlIncome(data);
  }

  async updatePlIncome(taxId, year, data) {
    return this.adapter.updatePlIncome(taxId, year, data);
  }

  async deletePlIncome(taxId, year) {
    return this.adapter.deletePlIncome(taxId, year);
  }

  // 查詢特定公司財務資料（關聯查詢）
  async getFinancialDataByCompany(company) {
    return this.adapter.getFinancialDataByCompany(company);
  }

  // 查詢特定公司損益表資料
  async getPlIncomeByCompany(company) {
    return this.adapter.getPlIncomeByCompany(company);
  }

  // 查詢特定公司財務報表資料
  async getFinancialBasicsByCompany(company) {
    return this.adapter.getFinancialBasicsByCompany(company);
  }

  // 根據稅號和年度查詢損益表
  async getPlIncomeByTaxIdAndYear(taxId, year) {
    return this.adapter.getPlIncomeByTaxIdAndYear(taxId, year);
  }

  // 根據稅號和年度查詢財務報表
  async getFinancialBasicsByTaxIdAndYear(taxId, year) {
    return this.adapter.getFinancialBasicsByTaxIdAndYear(taxId, year);
  }

  // 取得匯出資料
  async getExportData() {
    return this.adapter.getExportData();
  }

  // 批次匯入財務報表
  async batchUpsertFinancialBasics(records) {
    return this.adapter.batchUpsertFinancialBasics(records);
  }

  // 批次匯入損益表
  async batchUpsertPlIncome(records) {
    return this.adapter.batchUpsertPlIncome(records);
  }

  // 取得所有財務資料與公司關聯
  async getAllFinancialDataWithCompany() {
    return this.adapter.getAllFinancialDataWithCompany();
  }

  // 取得資料庫狀態（用於 UAT 顯示）
  async getDatabaseStatus() {
    return this.adapter.getDatabaseStatus();
  }

  // 關閉連線
  async close() {
    if (this.adapter.close) {
      await this.adapter.close();
    }
  }
}

// 工廠函式：建立 Repository 實例
export async function createRepository() {
  const adapter = await getDatabaseAdapter();
  return new BaseRepository(adapter);
}
