# 鈴木造船株式会社 船体部仕様書作成システム

## 概要
ブラウザのフォームに入力するだけで、船体部仕様書（Word .docx）を自動生成するシステム。

## 技術スタック
- Next.js 16（Pages Router）
- docx.js（Word生成）
- Vercel（ホスティング）

## ローカル開発
```bash
npm install
npm run dev
# http://localhost:3000 で確認
```

## デプロイ（Vercel）
1. このリポジトリをGitHubにpush
2. Vercelでリポジトリをインポート
3. Framework: Next.js（自動検出）
4. デプロイ完了

## ファイル構成
```
pages/
  index.js          # メインフォーム画面
  api/generate.js   # Word生成APIエンドポイント
lib/
  wordGenerator.js  # Word生成ロジック（docx.js）
```

## 入力可能な項目
- 表紙（船名・船種・工事番号・作成日）
- 一般計画（航行区域・用途・基本方針）
- 保証事項
- 主要要目（主要寸法・タンク容量・主機関・速力・乗組員）
- 各部の仕様（開口閉鎖・マスト・揚錨・操舵・荷役装置・通風・照明・消火・救命設備・航海機器・属具備品）
