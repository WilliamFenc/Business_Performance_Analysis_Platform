/**
 * 資料庫狀態顯示元件（UAT 暫時功能）
 * 顯示目前後端連線的資料庫類型
 */
import { useState, useEffect } from 'react';

const DatabaseStatusIndicator = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/db-status');
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error('取得資料庫狀態失敗:', error);
        setStatus({
          databaseType: 'unknown',
          status: 'failed',
          message: '無法取得狀態'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.indicator}>⚪</div>
        <div style={styles.text}>檢查中...</div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const indicator = status.status === 'connected' ? '🟢' : '🔴';
  const dbName = status.databaseType === 'supabase' ? 'Supabase' :
                  status.databaseType === 'sqlserver' ? 'SQL Server' :
                  status.databaseType;

  return (
    <div style={styles.container} title={status.message}>
      <div style={styles.indicator}>{indicator}</div>
      <div style={styles.text}>DB: {dbName}</div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid #e0e0e0',
    borderRadius: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    fontSize: '14px',
    fontWeight: '500',
    zIndex: 1000,
  },
  indicator: {
    fontSize: '16px',
  },
  text: {
    color: '#666',
  }
};

export default DatabaseStatusIndicator;
