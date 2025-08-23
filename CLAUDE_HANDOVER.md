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
- **残り日数**: 約38日

## 🏗️ 技術構成
- **フロントエンド**: React 18.2.0 + Recharts + Lucide React
- **バックエンド**: AWS Lambda (Node.js)
- **データベース**: DynamoDB (yokohama-posters)
- **API**: API Gateway (https://twt8aez0je.execute-api.ap-northeast-1.amazonaws.com/prod)
- **ホスティング**: S3 + CloudFront (予定)

## ✅ 完了項目 (2025/08/23 時点)
- [x] DynamoDB構築・稼働中
- [x] API Gateway設定完了
- [x] Lambda関数（analytics）稼働中
- [x] 戸塚区データ投入完了（331件）
- [x] Dashboard.jsx 95%実装完了
- [x] Google Drive - Claude連携構築
- [x] Git環境構築

## 🔄 進行中タスク
- [ ] src/services/api.js 実装確認
- [ ] App.jsx, index.js 統合確認
- [ ] 港北区データ投入準備
- [ ] GitHub Issues整理
- [ ] 残り17区のデータ準備・投入

## 📈 全体進捗: 75%

---

# 🛠️ 開発環境情報

## 📁 フォルダ構造
```
H:\マイドライブ\yokohama-poster-system\  ← 【統一ベースパス】
├── src/
│   ├── components/
│   │   └── Dashboard.jsx (95%完成)
│   └── services/
│       └── api.js (要確認)
├── public/
├── package.json
├── lambda-analytics.js
├── lambda-data-import.mjs
└── CLAUDE_HANDOVER.md
```

## 🔗 Git情報
- **Repository**: https://github.com/mmandai10/yokohama-poster-aws
- **Local Path**: H:\マイドライブ\yokohama-poster-system 【統一パス】
- **Current Branch**: main

## 🔧 開発コマンド
```powershell
# 必ずH:ドライブで作業
cd "H:\マイドライブ\yokohama-poster-system"
npm install
npm start
code .
git status
```

---

# 🌐 API稼働状況

## ✅ 稼働中エンドポイント
- GET /analytics/health - ヘルスチェック
- GET /analytics/summary - 全体統計（戸塚区331件確認済み）
- GET /analytics/by-district - 区別詳細統計
- GET /analytics/by-status - ステータス別統計
- GET /analytics/by-area - 投票区別統計

## 📊 最新データ状況
- 戸塚区: 331件登録済み
- 残り17区: 未投入
- ステータス: 全て「未着手」
- 完了率: 0%

## 🧪 テストコマンド
```bash
curl https://twt8aez0je.execute-api.ap-northeast-1.amazonaws.com/prod/analytics/summary
```

---

# 📋 優先タスク（更新版）

## 🔥 今週必須（8/23-8/30）
1. **Dashboard.jsx実装確認完了** - src/services/api.js確認
2. **App.jsx, index.js統合** - フロントエンド完全動作確認
3. **港北区データ投入** - 2番目の区としてテスト

## ⚡ 9月第1週（9/1-9/7）
- 残り16区のデータ生成スクリプト作成
- バッチインポート機能実装
- フロントエンド-バックエンド統合テスト
- エラーハンドリング強化

## 🎯 9月第2-3週（9/8-9/21）
- 全18区データ完全投入
- パフォーマンステスト
- PWA対応実装
- ユーザー権限管理機能追加

## 🚀 9月第4週（9/22-9/30）本番準備
- 本番環境最終テスト
- 運用手順書作成
- バックアップ・リストア手順確立
- 本番切替リハーサル

---

# 🔄 開発再開チェックリスト

## 環境確認
- [ ] **H:\マイドライブ\yokohama-poster-system** ディレクトリ存在確認【統一パス】
- [ ] npm install 実行済み確認
- [ ] AWS CLI設定確認
- [ ] Git最新状態確認

## 🚨 重要な注意事項
- **必ずH:ドライブを使用** - F:ドライブは使用しない
- **Google Drive同期確認** - H:\マイドライブが同期されていることを確認
- **引き継ぎファイル更新時** - 必ずH:\マイドライブ\yokohama-poster-system\CLAUDE_HANDOVER.mdを更新

## 即座の対応項目
1. api.js実装状態確認
2. Dashboard.jsxとの連携テスト
3. 港北区サンプルデータ生成

---

# 📝 更新履歴

- **2025/08/23**: 本番稼働日を9月30日に延長、開発スケジュール再編成
- **2025/08/03**: 初版作成、戸塚区データ投入完了

## 🤖 Claude開発支援再開手順

1. このファイル確認完了 ✅
2. 開発環境動作確認
3. 優先タスクから作業選択
4. VSCode/PowerShell操作支援開始

## 🔄 最終更新: 2025/08/23 05:11