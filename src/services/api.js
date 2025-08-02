// 横浜ポスター管理システム API サービス
const API_BASE = 'https://twt8aez0je.execute-api.ap-northeast-1.amazonaws.com/prod';

// 統計サマリー取得
export const getSummary = async () => {
  try {
    const response = await fetch(`${API_BASE}/analytics/summary`);
    if (!response.ok) throw new Error('API通信失敗');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('統計サマリー取得エラー:', error);
    return { error: true, message: 'データ取得に失敗しました' };
  }
};

// 区別統計取得  
export const getDistrictStats = async () => {
  try {
    const response = await fetch(`${API_BASE}/analytics/by-district`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors'
    });
    if (!response.ok) throw new Error('API通信失敗');
    return response.json();
  } catch (error) {
    console.error('区別統計取得エラー:', error);
    return { districts: {}, error: true };
  }
};