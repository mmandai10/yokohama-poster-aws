// src/services/api.js
// 横浜ポスター管理システム - APIサービス

const API_BASE_URL = 'https://twt8aez0je.execute-api.ap-northeast-1.amazonaws.com/prod';

class ApiService {
  // ヘルスチェック
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // サマリー情報取得
  async getSummary() {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      throw error;
    }
  }

  // 区別統計取得
  async getByDistrict() {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/by-district`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch district data:', error);
      throw error;
    }
  }

  // ステータス別統計取得
  async getByStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/by-status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch status data:', error);
      throw error;
    }
  }

  // エリア別統計取得
  async getByArea() {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/by-area`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch area data:', error);
      throw error;
    }
  }
}

// シングルトンインスタンスをエクスポート
const apiService = new ApiService();
export default apiService;