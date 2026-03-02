/**
 * SQL Server 資料庫適配器
 * 使用 mssql 套件連接 SQL Server，將 Supabase 查詢轉換為 SQL Server SQL 語法
 */
import sql from 'mssql';
import { convertToMillions } from '../../../lib/_lib.js';

export class SqlServerAdapter {
  constructor() {
    const config = {
      server: process.env.SQLSERVER_SERVER,
      database: process.env.SQLSERVER_DATABASE,
      user: process.env.SQLSERVER_USER,
      password: process.env.SQLSERVER_PASSWORD,
      port: parseInt(process.env.SQLSERVER_PORT || '1433'),
      options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
      },
      requestTimeout: parseInt(process.env.SQLSERVER_TIMEOUT || '30000')
    };

    if (!config.server || !config.database) {
      throw new Error('缺少 SQL Server 資料庫設定');
    }

    this.config = config;
    this.pool = null;
    this.type = 'sqlserver';
  }

  // 建立連線池（懶初始化）
  async getPool() {
    if (!this.pool) {
      this.pool = await sql.connect(this.config);
    }
    return this.pool;
  }

  async getCompanies() {
    const pool = await this.getPool();
    const result = await pool.request()
      .query('SELECT id, company_name FROM companies ORDER BY company_name');

    return result.recordset.map(row => ({
      id: row.id,
      name: row.company_name,
    }));
  }

  async getFinancialBasics(filters = {}) {
    const pool = await this.getPool();
    let query = `
      SELECT *
      FROM financial_basics
      WHERE 1=1
    `;
    const request = pool.request();

    if (filters.taxId) {
      query += ' AND tax_id = @taxId';
      request.input('taxId', sql.NVarChar(8), filters.taxId);
    }
    if (filters.fiscalYear) {
      query += ' AND fiscal_year = @fiscalYear';
      request.input('fiscalYear', sql.Int, filters.fiscalYear);
    }
    if (filters.companyName) {
      query += ' AND company_name = @companyName';
      request.input('companyName', sql.NVarChar, filters.companyName);
    }

    query += ' ORDER BY fiscal_year DESC, tax_id ASC';

    const result = await request.query(query);
    return result.recordset;
  }

  async upsertFinancialBasics(data) {
    const pool = await this.getPool();

    // SQL Server 使用 MERGE 語法進行 upsert
    // 構建欄位清單
    const { fiscal_year, tax_id, ...updateFields } = data;
    const columns = Object.keys(data);
    const valueParams = columns.map(k => `@${k}`).join(', ');

    // 構建 SET 子句
    const setClause = Object.keys(updateFields)
      .map(key => `${key} = @${key}`)
      .join(', ');

    const query = `
      MERGE INTO financial_basics AS target
      USING (SELECT @fiscal_year AS fiscal_year, @tax_id AS tax_id) AS source
      ON target.fiscal_year = source.fiscal_year AND target.tax_id = source.tax_id
      WHEN MATCHED THEN
        UPDATE SET ${setClause}
      WHEN NOT MATCHED THEN
        INSERT (${columns.join(', ')})
        VALUES (${valueParams})
      OUTPUT inserted.*;
    `;

    const request = pool.request();
    for (const [key, value] of Object.entries(data)) {
      request.input(key, this.inferSqlType(key, value), value);
    }

    const result = await request.query(query);
    return result.recordset[0] || null;
  }

  async updateFinancialBasics(taxId, year, data) {
    const pool = await this.getPool();

    // 移除主鍵欄位
    const { fiscal_year, tax_id, ...updateFields } = data;

    if (Object.keys(updateFields).length === 0) {
      throw new Error('沒有要更新的欄位');
    }

    const setClause = Object.keys(updateFields)
      .map(key => `${key} = @${key}`)
      .join(', ');

    const query = `
      UPDATE financial_basics
      SET ${setClause}
      OUTPUT inserted.*
      WHERE tax_id = @taxId AND fiscal_year = @fiscalYear
    `;

    const request = pool.request();
    request.input('taxId', sql.NVarChar(8), taxId);
    request.input('fiscalYear', sql.Int, year);

    for (const [key, value] of Object.entries(updateFields)) {
      request.input(key, this.inferSqlType(key, value), value);
    }

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      throw new Error('找不到指定的財務報表資料');
    }

    return result.recordset[0];
  }

  async deleteFinancialBasics(taxId, year) {
    const pool = await this.getPool();

    // 先查詢資料是否存在
    const selectQuery = `
      SELECT *
      FROM financial_basics
      WHERE tax_id = @taxId AND fiscal_year = @fiscalYear
    `;

    const selectRequest = pool.request();
    selectRequest.input('taxId', sql.NVarChar(8), taxId);
    selectRequest.input('fiscalYear', sql.Int, year);

    const selectResult = await selectRequest.query(selectQuery);

    if (selectResult.recordset.length === 0) {
      throw new Error('找不到指定的財務報表資料');
    }

    const existingData = selectResult.recordset[0];

    // 刪除資料
    const deleteQuery = `
      DELETE FROM financial_basics
      WHERE tax_id = @taxId AND fiscal_year = @fiscalYear
    `;

    const deleteRequest = pool.request();
    deleteRequest.input('taxId', sql.NVarChar(8), taxId);
    deleteRequest.input('fiscalYear', sql.Int, year);

    await deleteRequest.query(deleteQuery);

    return existingData;
  }

  async getPlIncome(filters = {}) {
    const pool = await this.getPool();
    let query = `
      SELECT *
      FROM pl_income_basics
      WHERE 1=1
    `;
    const request = pool.request();

    if (filters.taxId) {
      query += ' AND tax_id = @taxId';
      request.input('taxId', sql.NVarChar(8), filters.taxId);
    }
    if (filters.fiscalYear) {
      query += ' AND fiscal_year = @fiscalYear';
      request.input('fiscalYear', sql.Int, filters.fiscalYear);
    }
    if (filters.companyName) {
      query += ' AND company_name = @companyName';
      request.input('companyName', sql.NVarChar, filters.companyName);
    }

    query += ' ORDER BY fiscal_year DESC, tax_id ASC';

    const result = await request.query(query);
    return result.recordset;
  }

  async upsertPlIncome(data) {
    const pool = await this.getPool();

    const { fiscal_year, tax_id, ...updateFields } = data;
    const columns = Object.keys(data);
    const valueParams = columns.map(k => `@${k}`).join(', ');
    const setClause = Object.keys(updateFields)
      .map(key => `${key} = @${key}`)
      .join(', ');

    const query = `
      MERGE INTO pl_income_basics AS target
      USING (SELECT @fiscal_year AS fiscal_year, @tax_id AS tax_id) AS source
      ON target.fiscal_year = source.fiscal_year AND target.tax_id = source.tax_id
      WHEN MATCHED THEN
        UPDATE SET ${setClause}
      WHEN NOT MATCHED THEN
        INSERT (${columns.join(', ')})
        VALUES (${valueParams})
      OUTPUT inserted.*;
    `;

    const request = pool.request();
    for (const [key, value] of Object.entries(data)) {
      request.input(key, this.inferSqlType(key, value), value);
    }

    const result = await request.query(query);
    return result.recordset[0] || null;
  }

  async updatePlIncome(taxId, year, data) {
    const pool = await this.getPool();

    const { fiscal_year, tax_id, ...updateFields } = data;

    if (Object.keys(updateFields).length === 0) {
      throw new Error('沒有要更新的欄位');
    }

    const setClause = Object.keys(updateFields)
      .map(key => `${key} = @${key}`)
      .join(', ');

    const query = `
      UPDATE pl_income_basics
      SET ${setClause}
      OUTPUT inserted.*
      WHERE tax_id = @taxId AND fiscal_year = @fiscalYear
    `;

    const request = pool.request();
    request.input('taxId', sql.NVarChar(8), taxId);
    request.input('fiscalYear', sql.Int, year);

    for (const [key, value] of Object.entries(updateFields)) {
      request.input(key, this.inferSqlType(key, value), value);
    }

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      throw new Error('找不到指定的損益表資料');
    }

    return result.recordset[0];
  }

  async deletePlIncome(taxId, year) {
    const pool = await this.getPool();

    const selectQuery = `
      SELECT *
      FROM pl_income_basics
      WHERE tax_id = @taxId AND fiscal_year = @fiscalYear
    `;

    const selectRequest = pool.request();
    selectRequest.input('taxId', sql.NVarChar(8), taxId);
    selectRequest.input('fiscalYear', sql.Int, year);

    const selectResult = await selectRequest.query(selectQuery);

    if (selectResult.recordset.length === 0) {
      throw new Error('找不到指定的損益表資料');
    }

    const existingData = selectResult.recordset[0];

    const deleteQuery = `
      DELETE FROM pl_income_basics
      WHERE tax_id = @taxId AND fiscal_year = @fiscalYear
    `;

    const deleteRequest = pool.request();
    deleteRequest.input('taxId', sql.NVarChar(8), taxId);
    deleteRequest.input('fiscalYear', sql.Int, year);

    await deleteRequest.query(deleteQuery);

    return existingData;
  }

  async getPlIncomeByCompany(company) {
    const pool = await this.getPool();
    const query = `
      SELECT *
      FROM pl_income_basics
      WHERE company_name = @company
      ORDER BY fiscal_year
    `;

    const request = pool.request();
    request.input('company', sql.NVarChar, company);

    const result = await request.query(query);
    return result.recordset;
  }

  async getFinancialBasicsByCompany(company) {
    const pool = await this.getPool();
    const query = `
      SELECT *
      FROM financial_basics
      WHERE company_name = @company
      ORDER BY fiscal_year
    `;

    const request = pool.request();
    request.input('company', sql.NVarChar, company);

    const result = await request.query(query);
    return result.recordset;
  }

  async getPlIncomeByTaxIdAndYear(taxId, year) {
    const pool = await this.getPool();
    const query = `
      SELECT *
      FROM pl_income_basics
      WHERE tax_id = @taxId AND fiscal_year = @year
    `;

    const request = pool.request();
    request.input('taxId', sql.NVarChar(8), taxId);
    request.input('year', sql.Int, year);

    const result = await request.query(query);
    return result.recordset[0] || null;
  }

  async getFinancialBasicsByTaxIdAndYear(taxId, year) {
    const pool = await this.getPool();
    const query = `
      SELECT *
      FROM financial_basics
      WHERE tax_id = @taxId AND fiscal_year = @year
    `;

    const request = pool.request();
    request.input('taxId', sql.NVarChar(8), taxId);
    request.input('year', sql.Int, year);

    const result = await request.query(query);
    return result.recordset[0] || null;
  }

  async getExportData() {
    const pool = await this.getPool();
    const query = `
      SELECT
        p.fiscal_year,
        p.operating_revenue_total,
        p.profit_before_tax,
        c.company_name
      FROM pl_income_basics p
      INNER JOIN companies c ON p.company_name = c.company_name
      ORDER BY p.fiscal_year
    `;

    const result = await pool.request().query(query);
    return result.recordset;
  }

  async batchUpsertFinancialBasics(records) {
    // SQL Server batch upsert 實作
    const results = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    const pool = await this.getPool();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      for (const record of records) {
        if (!record.fiscal_year || !record.tax_id) {
          results.skipped++;
          continue;
        }

        const request = transaction.request();
        request.input('taxId', sql.NVarChar(8), record.tax_id);
        request.input('fiscalYear', sql.Int, record.fiscal_year);

        // 檢查是否已存在
        const checkResult = await request.query(`
          SELECT id FROM financial_basics
          WHERE tax_id = @taxId AND fiscal_year = @fiscalYear
        `);

        const params = Object.entries(record).filter(([k]) => !['id', 'created_at', 'updated_at'].includes(k));
        const setClause = params.map(([k]) => `${k} = @${k}`).join(', ');
        const valuesClause = params.map(([k]) => `@${k}`).join(', ');
        const columns = params.map(([k]) => k).join(', ');

        if (checkResult.recordset.length > 0) {
          // UPDATE
          const updateReq = transaction.request();
          updateReq.input('taxId', sql.NVarChar(8), record.tax_id);
          updateReq.input('fiscalYear', sql.Int, record.fiscal_year);
          params.forEach(([k, v]) => {
            updateReq.input(k, this.inferSqlType(k, v), v);
          });

          await updateReq.query(`
            UPDATE financial_basics
            SET ${setClause}
            WHERE tax_id = @taxId AND fiscal_year = @fiscalYear
          `);
          results.updated++;
        } else {
          // INSERT
          const insertReq = transaction.request();
          params.forEach(([k, v]) => {
            insertReq.input(k, this.inferSqlType(k, v), v);
          });

          await insertReq.query(`
            INSERT INTO financial_basics (${columns})
            VALUES (${valuesClause})
          `);
          results.inserted++;
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      results.errors.push(error.message);
    }

    return results;
  }

  async batchUpsertPlIncome(records) {
    // SQL Server batch upsert for pl_income_basics
    const results = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    const pool = await this.getPool();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      for (const record of records) {
        if (!record.fiscal_year || !record.tax_id) {
          results.skipped++;
          continue;
        }

        const request = transaction.request();
        request.input('taxId', sql.NVarChar(8), record.tax_id);
        request.input('fiscalYear', sql.Int, record.fiscal_year);

        const checkResult = await request.query(`
          SELECT id FROM pl_income_basics
          WHERE tax_id = @taxId AND fiscal_year = @fiscalYear
        `);

        const params = Object.entries(record).filter(([k]) => !['id', 'created_at', 'updated_at'].includes(k));
        const setClause = params.map(([k]) => `${k} = @${k}`).join(', ');
        const valuesClause = params.map(([k]) => `@${k}`).join(', ');
        const columns = params.map(([k]) => k).join(', ');

        if (checkResult.recordset.length > 0) {
          const updateReq = transaction.request();
          updateReq.input('taxId', sql.NVarChar(8), record.tax_id);
          updateReq.input('fiscalYear', sql.Int, record.fiscal_year);
          params.forEach(([k, v]) => {
            updateReq.input(k, this.inferSqlType(k, v), v);
          });

          await updateReq.query(`
            UPDATE pl_income_basics
            SET ${setClause}
            WHERE tax_id = @taxId AND fiscal_year = @fiscalYear
          `);
          results.updated++;
        } else {
          const insertReq = transaction.request();
          params.forEach(([k, v]) => {
            insertReq.input(k, this.inferSqlType(k, v), v);
          });

          await insertReq.query(`
            INSERT INTO pl_income_basics (${columns})
            VALUES (${valuesClause})
          `);
          results.inserted++;
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      results.errors.push(error.message);
    }

    return results;
  }

  async getFinancialDataByCompany(company) {
    const pool = await this.getPool();
    const query = `
      SELECT
        fiscal_year,
        operating_revenue_total,
        profit_before_tax
      FROM pl_income_basics
      WHERE company_name = @company
      ORDER BY fiscal_year
    `;

    const request = pool.request();
    request.input('company', sql.NVarChar, company);

    const result = await request.query(query);

    return {
      company: company,
      data: {
        labels: result.recordset.map(row => String(row.fiscal_year)),
        revenue: result.recordset.map(row => convertToMillions(row.operating_revenue_total)),
        profit: result.recordset.map(row => convertToMillions(row.profit_before_tax)),
      }
    };
  }

  async getAllFinancialDataWithCompany() {
    const pool = await this.getPool();
    const query = `
      SELECT
        c.id AS company_id,
        c.company_name AS company,
        p.fiscal_year AS year,
        p.operating_revenue_total,
        p.profit_before_tax
      FROM pl_income_basics p
      INNER JOIN companies c ON p.company_name = c.company_name
      ORDER BY c.company_name, p.fiscal_year DESC
    `;

    const result = await pool.request().query(query);

    return result.recordset.map(row => ({
      company_id: row.company_id,
      company: row.company,
      year: row.year,
      revenue: convertToMillions(row.operating_revenue_total),
      profit: convertToMillions(row.profit_before_tax),
    }));
  }

  async getDatabaseStatus() {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .query('SELECT TOP 1 id FROM companies');

      return {
        databaseType: 'sqlserver',
        status: 'connected',
        message: '已連接至 SQL Server'
      };
    } catch (error) {
      return {
        databaseType: 'sqlserver',
        status: 'failed',
        message: `連線失敗: ${error.message}`
      };
    }
  }

  // 輔助方法：推斷 SQL Server 資料型別
  inferSqlType(key, value) {
    if (key === 'fiscal_year') return sql.Int;
    if (key === 'tax_id') return sql.NVarChar(8);
    if (typeof value === 'number') {
      return Number.isInteger(value) ? sql.Int : sql.Decimal(18, 2);
    }
    return sql.NVarChar(sql.MAX);
  }

  // 優雅關閉連線
  async close() {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }
}
