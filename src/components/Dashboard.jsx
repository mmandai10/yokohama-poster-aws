import React, { useState, useEffect } from 'react';
import { getSummary, getDistrictStats } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// チャート用カラーパレット
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
      // 本番API呼び出し
      const summaryData = await getSummary();
      
      // モックデータで代替（CORS問題回避）
      const mockDistrictData = {
        districts: {
          '戸塚区': {
            totalPosters: 331,
            byStatus: { '未着手': 331, '完了': 0 },
            completionRate: 0
          }
        }
      };
      
      setData({
        summary: summaryData,
        districts: mockDistrictData,
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

  // チャート用データ変換
  const getChartData = () => {
    if (!data.summary?.byDistrict) return [];
    
    return Object.entries(data.summary.byDistrict).map(([district, count]) => ({
      name: district,
      value: count,
      completed: 0, // 完了数（現在は0）
      pending: count // 未完了数
    }));
  };

  const getPieData = () => {
    if (!data.summary?.byStatus) return [];
    
    return Object.entries(data.summary.byStatus).map(([status, count]) => ({
      name: status,
      value: count
    }));
  };

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

      {/* チャートセクション */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px',
        marginTop: '30px'
      }}>
        {/* 区別進捗チャート */}
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <h3>📊 区別進捗チャート</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ステータス別円グラフ */}
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <h3>🥧 ステータス別分布</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={getPieData()}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {getPieData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
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