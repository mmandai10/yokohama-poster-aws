# 🤖 横浜ポスター管理システム - Claude完全引継ぎ情報

## 🎯 新チャット開始時の簡単指示

```
横浜ポスター管理システムの開発継続のため、Google DriveでCLAUDE_HANDOVER.mdを検索・取得してプロジェクト状況を把握してください。フォルダID: 1gij5Xk6aUTtIpQNnvs4JWiyaGFjo_TMx
```

---

# 📊 プロジェクト概要・進捗

## 🎯 基本情報
- **プロジェクト名**: 横浜ポスター管理システム
- **目的**: 選挙ポスター掲示板管理の完全デジタル化
- **対象**: 横浜市全18区のポスター掲示板
- **本番稼働予定**: 2025年9月30日（1か月延長）
- **残り日数**: 約37日（2025/08/24時点）

## 🏗️ 技術構成
- **フロントエンド**: React 18.2.0 + Recharts + Lucide React
- **バックエンド**: AWS Lambda (Node.js 18.x, ES Module形式)
- **データベース**: DynamoDB (yokohama-posters)
- **API**: API Gateway (https://twt8aez0je.execute-api.ap-northeast-1.amazonaws.com/prod)
- **ホスティング**: S3 + CloudFront (予定)

## ✅ 完了項目 (2025/08/24 14:45 時点)
- [x] DynamoDB構築・稼働中
- [x] API Gateway設定完了
- [x] Lambda関数（analytics）稼働中
- [x] 戸塚区データ投入完了（331件）
- [x] Dashboard.jsx 100%実装完了
- [x] Google Drive - Claude連携構築
- [x] Git環境構築
- [x] GitHubリポジトリ同期完了
- [x] C:ドライブ開発環境構築完了
- [x] npm install成功（1380パッケージ）
- [x] npm start成功・アプリ正常動作確認
- [x] **APIとの動的接続確認完了（2025/08/24）** ✅
- [x] **CORSエラー完全解決（2025/08/24）** ✅
- [x] **リアルタイムデータ表示成功（2025/08/24）** ✅

## 🔄 進行中タスク
- [ ] 港北区データ投入準備
- [ ] 残り16区のデータ準備・投入
- [ ] ポスター状態更新機能実装
- [ ] 認証機能実装
- [ ] S3 + CloudFrontデプロイ

## 📈 全体進捗: 85%

---

# 🛠️ 開発環境情報【重要変更あり】

## ⚠️ 開発環境の二重構成（重要）

### 📁 開発作業用フォルダ（npm実行場所）
```
C:\Projects\yokohama-poster-system\  ← 【開発はここ】
├── src/
│   ├── components/
│   │   └── Dashboard.jsx (動作確認済み✅)
│   └── services/
│       └── api.js (未使用・Dashboard内で直接実装)
├── public/
├── package.json
├── node_modules/ （1380パッケージインストール済み）
└── その他ファイル
```

### 📁 Claude連携・バックアップ用フォルダ
```
H:\マイドライブ\yokohama-poster-system\  ← 【Claude確認・バックアップ用】
├── src/ （ソースコードのコピー）
├── CLAUDE_HANDOVER.md （このファイル）
├── package.json
└── その他重要ファイル（node_modules以外）
```

## 🔄 なぜ二重構成が必要か
- **問題**: Google Drive（H:ドライブ）で`npm install`実行時にTAR_ENTRY_ERRORが発生
- **原因**: Google Driveの同期とnpmのファイル書き込みが競合
- **解決**: C:ドライブで開発、H:ドライブにバックアップ

## 🔗 Git情報
- **Repository**: https://github.com/mmandai10/yokohama-poster-aws
- **Local Path**: C:\Projects\yokohama-poster-system 【開発用】
- **Backup Path**: H:\マイドライブ\yokohama-poster-system 【Claude用】
- **Current Branch**: master（GitHubのmainと同期済み）
- **最終push**: 2025/08/23 - 18ファイルをGitHubに同期完了

## 🔧 開発コマンド
```powershell
# 開発作業開始時
cd "C:\Projects\yokohama-poster-system"
npm start    # 開発サーバー起動（動作確認済み✅）
code .       # VSCode起動

# 作業終了時（重要ファイルをH:ドライブにコピー）
robocopy C:\Projects\yokohama-poster-system H:\マイドライブ\yokohama-poster-system /E /XD node_modules .git

# Git操作
git status
git add .
git commit -m "変更内容"
git push origin master:main
```

---

# 🌐 AWS構成詳細

## 📊 DynamoDB
- **テーブル名**: yokohama-posters
- **パーティションキー**: poster_id (String)
- **登録データ**: 戸塚区331件
- **データ構造**:
```json
{
  "poster_id": "T001",
  "district": "戸塚区",
  "voting_area": "第1投票区",
  "location": "戸塚小学校正門横",
  "board_number": "1",
  "status": "未着手",
  "last_updated": "2025-08-03T12:00:00Z"
}
```

## ⚡ Lambda関数
- **関数名**: analytics
- **ランタイム**: Node.js 18.x
- **メモリ**: 128 MB
- **タイムアウト**: 3秒
- **エンドポイント**:
  - /analytics/health - ヘルスチェック
  - /analytics/summary - 全体統計
  - /analytics/by-district - 区別統計
  - /analytics/by-status - ステータス別統計
  - /analytics/by-area - 投票区別統計

### 重要：CORSヘッダー設定
```javascript
const createResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    },
    body: JSON.stringify(body)
  };
};
```

## 🔌 API Gateway
- **API名**: yokohama-poster-api
- **ステージ**: prod
- **URL**: https://twt8aez0je.execute-api.ap-northeast-1.amazonaws.com/prod
- **統合タイプ**: Lambdaプロキシ統合
- **CORS**: 有効（Lambda関数でヘッダー返却）

---

# 🖥️ アプリ動作状況（2025/08/24 14:45）

## ✅ 正常動作確認項目
- **URL**: http://localhost:3000
- **タイトル**: 「横浜ポスター管理システム」正常表示 ✅
- **API接続**: リアルタイムデータ取得成功 ✅
- **統計カード**: 
  - 総ポスター数: 331件 ✅
  - 完了率: 0% ✅
  - 対象区数: 1区 ✅
- **グラフ表示**:
  - 区別進捗チャート: 戸塚区331件表示 ✅
  - ステータス別分布: 円グラフ（全て未着手）✅
- **テーブル表示**: 戸塚区 331件 正常表示 ✅

---

# 🔧 トラブルシューティング履歴

## 2025/08/24 解決済み問題

### 1. react-scripts not found エラー
**原因**: node_modulesにreact-scriptsが含まれていなかった
**解決**: `npm install react-scripts@5.0.1 --save`

### 2. CORSエラー
**原因**: Lambda関数がCORSヘッダーを返していなかった
**解決**: createResponse関数で全レスポンスにCORSヘッダー追加

### 3. Cardコンポーネントエラー
**原因**: UIライブラリ未インストール
**解決**: インラインスタイルでシンプル版に変更

### 4. API接続エラー
**原因**: Dashboard.jsxのimport文の不一致
**解決**: Dashboard.jsx内で直接fetch関数を定義

---

# 📋 次回の優先タスク

## 🔥 即座に対応（次回チャット開始時）

### 1. 港北区データ投入
```javascript
// lambda-data-import.mjsを使用
// 2番目の区として追加
```

### 2. ステータス更新機能実装
- PUT /posters/{poster_id}/status エンドポイント追加
- フロントエンドに更新ボタン追加

### 3. 認証機能の基本実装
- 簡易JWT認証
- ログイン画面作成

## ⚡ 今週中（8/24-8/31）
- 残り16区のデータ生成スクリプト作成
- バッチインポート機能実装
- エラーハンドリング強化
- ローディング状態の改善

## 🎯 9月第1週（9/1-9/7）
- S3バケット作成・設定
- CloudFrontディストリビューション設定
- 本番環境デプロイ
- パフォーマンス最適化

---

# 🔄 開発再開チェックリスト

## 環境確認
- [ ] **C:\Projects\yokohama-poster-system** に移動
- [ ] `npm start` でアプリ起動
- [ ] http://localhost:3000 で動作確認
- [ ] AWS Consoleログイン確認
- [ ] Git最新状態確認（`git status`）

## APIテスト
```powershell
# API動作確認
curl https://twt8aez0je.execute-api.ap-northeast-1.amazonaws.com/prod/analytics/summary
```

## 🚨 重要な注意事項
- **必ずC:\Projectsで開発作業を実施**
- **Lambda関数修正後は必ずDeploy**
- **API Gateway変更後は必ずAPIをデプロイ**
- **CORSヘッダーはLambda関数で返す**（プロキシ統合のため）
- **作業終了時は必ずrobocopyでバックアップ**

---

# 📝 更新履歴

## 2025/08/24 14:45
- **API接続完全成功！** ✨
- CORSエラー完全解決
- リアルタイムデータ表示成功
- Dashboard.jsxをシンプル版に変更
- react-scripts個別インストール実施

## 2025/08/23 17:30
- アプリ正常起動確認完了
- Dashboard完璧に表示（戸塚区331件）
- グラフ・統計表示すべて正常動作

## 2025/08/23 17:00
- Git環境整理、初回コミット作成
- GitHubリポジトリ（main）へpush完了
- C:\Projectsに開発環境構築（Google Driveエラー回避）
- npm install成功（277パッケージ → 1380パッケージに増加）
- 開発環境の二重構成確立（C:開発、H:バックアップ）

## 2025/08/23 05:11
- 本番稼働日を9月30日に延長、開発スケジュール再編成

## 2025/08/03
- 初版作成、戸塚区データ投入完了

---

# 🎉 現在の成果

- **基盤構築**: 100% ✅
- **API開発**: 90% ✅
- **フロントエンド**: 85% ✅
- **データ投入**: 戸塚区完了、残り17区
- **本番環境**: 未着手

## 🔄 最終更新: 2025/08/24 14:45