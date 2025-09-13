// src/components/Dashboard.jsx
// 横浜ポスター管理システム - ダッシュボード（シンプル版）

import React, { useState, useEffect } from 'react';
import StatusUpdateButton from './StatusUpdateButton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// APIエンドポイント
const API_BASE_URL = 'https://twt8aez0je.execute-api.ap-northeast-1.amazonaws.com/prod';

const fetchSummary = async () => {
  const response = await fetch(`${API_BASE_URL}/analytics/summary`);
  return await response.json();
};

const fetchByDistrict = async () => {
  const response = await fetch(`${API_BASE_URL}/analytics/by-district`);
  return await response.json();
};

const fetchByStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/analytics/by-status`);
  return await response.json();
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    completion_rate: 0,
    districts: 0
  });
  
  const [districtData, setDistrictData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // サマリーデータの取得
        const summaryData = await fetchSummary();
        setStats({
          total: summaryData.total_posters || 0,
          completed: summaryData.completed_posters || 0,
          completion_rate: summaryData.completion_rate || 0,
          districts: summaryData.distinct_districts || 0
        });

        // 区別データの取得
        const districtResponse = await fetchByDistrict();
        const formattedDistrictData = Object.entries(districtResponse).map(([name, data]) => ({
          name,
          total: data.total,
          completed: data.completed,
          pending: data.pending,
          not_started: data.not_started
        }));
        setDistrictData(formattedDistrictData);

        // ステータス別データの取得
        const statusResponse = await fetchByStatus();
        const formattedStatusData = [
          { name: '未着手', value: statusResponse['未着手'] || 0, color: '#ef4444' },
          { name: '着手中', value: statusResponse['着手中'] || 0, color: '#f59e0b' },
          { name: '完了', value: statusResponse['完了'] || 0, color: '#10b981' }
        ];
        setStatusData(formattedStatusData);
        
        setError(null);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '20px' }}>データを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '20px', color: 'red' }}>{error}</div>
      </div>
    );
  }

  // シンプルなカードスタイル
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    marginBottom: '20px'
  };

  const statCardStyle = {
    ...cardStyle,
    textAlign: 'center',
    flex: 1,
    margin: '0 10px'
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
          横浜ポスター管理システム
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          リアルタイムデータ表示中 - API接続成功 ✅
        </p>
      </div>

      {/* 統計カード */}
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '30px' }}>
        <div style={statCardStyle}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>総ポスター数</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>{stats.total}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>全掲示場所</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>完了数</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981' }}>{stats.completed}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>掲示完了</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>完了率</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3b82f6' }}>{stats.completion_rate}%</div>
          <div style={{ fontSize: '12px', color: '#999' }}>進捗状況</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>対象区数</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.districts}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>管理対象</div>
        </div>
      </div>

      {/* グラフエリア */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {/* 区別進捗状況 */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>区別進捗状況</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={districtData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" name="完了" />
              <Bar dataKey="pending" fill="#f59e0b" name="着手中" />
              <Bar dataKey="not_started" fill="#ef4444" name="未着手" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ステータス別分布 */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>ステータス別分布</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 詳細テーブル */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>区別詳細</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>区名</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>総数</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>完了</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>着手中</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>未着手</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>完了率</th>
              </tr>
            </thead>
            <tbody>
              {districtData.map((district, index) => (
                <tr key={district.name} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>{district.name}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>{district.total}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>{district.completed}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>{district.pending}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>{district.not_started}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {district.total > 0 ? Math.round((district.completed / district.total) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
{/* 個別ポスター一覧 */}
<div style={{marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '8px'}}>
  <h2>ポスター個別管理</h2>
  <p>最新10件のポスター</p>
  <table style={{width: '100%', borderCollapse: 'collapse'}}>
    <thead>
      <tr style={{backgroundColor: '#f8f9fa'}}>
        <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>ポスター番号</th>
        <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>区</th>
        <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>住所</th>
        <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>ステータス</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style={{padding: '12px', borderBottom: '1px solid #dee2e6'}}>テストデータ</td>
        <td style={{padding: '12px', borderBottom: '1px solid #dee2e6'}}>港北区</td>
        <td style={{padding: '12px', borderBottom: '1px solid #dee2e6'}}>テスト住所</td>
        <td style={{padding: '12px', borderBottom: '1px solid #dee2e6'}}>
          <StatusUpdateButton 
            poster={{posterNumber: 'kohoku-01-001', status: 'notStarted'}} 
            onUpdate={() => window.location.reload()} 
          />
        </td>
      </tr>
    </tbody>
  </table>
</div>
      </div>
    </div>
  );
};

export default Dashboard;