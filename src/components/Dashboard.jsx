import React, { useState, useEffect } from 'react';
import { getSummary, getDistrictStats } from '../services/api';

function Dashboard() {
  const [data, setData] = useState({
    summary: null,
    districts: null,
    loading: true,
    error: null
  });

  // データ取得関数
  const fetchData = async () => {
    setData(prev => ({ ...prev, loading: true }));
    
    try {
      const summaryData = await getSummary();
      const districtData = await getDistrictStats();
      
      setData({
        summary: summaryData,
        districts: districtData,
        loading: false,
        error: null
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'データ取得に失敗しました'
      }));
    }
  };

  // 初回データ取得
  useEffect(() => {
    fetchData();
  }, []);

  if (data.loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>📊 データ読み込み中...</h2>
      </div>
    );
  }

  if (data.error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <h2>❌ {data.error}</h2>
        <button onClick={fetchData}>再試行</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🎯 横浜ポスター管理システム</h1>
      
      {/* 統計サマリー */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3>📍 総ポスター数</h3>
          <p style={{ fontSize: '24px', margin: '10px 0' }}>
            {data.summary?.totalPosters?.toLocaleString() || 0}件
          </p>
        </div>
        
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3>✅ 完了率</h3>
          <p style={{ fontSize: '24px', margin: '10px 0' }}>
            {data.summary?.completionRate || 0}%
          </p>
        </div>
        
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3>🏢 対象区数</h3>
          <p style={{ fontSize: '24px', margin: '10px 0' }}>
            {Object.keys(data.summary?.byDistrict || {}).length}区
          </p>
        </div>
      </div>

      {/* 区別詳細 */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
        <h2>📊 区別進捗状況</h2>
        {Object.entries(data.summary?.byDistrict || {}).map(([district, count]) => (
          <div key={district} style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: '1px solid #ddd'
          }}>
            <span>{district}</span>
            <span>{count.toLocaleString()}件</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button 
          onClick={fetchData}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 データ更新
        </button>
      </div>
    </div>
  );
}

export default Dashboard;