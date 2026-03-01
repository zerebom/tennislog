# TennisLog

テニスの家計簿 - ざっくり記録→上達が見える

## Tech Stack

- Vite + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Zustand + persist middleware (localStorage)
- React Router v7
- date-fns, nanoid, lucide-react
- vite-plugin-pwa

## Directory Structure

```
src/
├── components/      # 共有UIコンポーネント
│   └── ui/          # shadcn/ui コンポーネント
├── pages/           # ページコンポーネント
├── stores/          # Zustand stores
├── lib/             # ユーティリティ
└── types.ts         # 型定義
steering/            # 設計ドキュメント（要件、デザイン、ワークフロー）
docs/                # プロジェクトドキュメント
```

## Commands

- `npm run dev` - 開発サーバー起動
- `npx vite build` - ビルド
- `npx serve dist -l 3000` - プロダクションサーバー起動
- `npx tsc --noEmit` - 型チェック

## Conventions

- パスエイリアス: `@/` → `src/`
- カラーパレット: design-direction.md の提案に従う（primary: #1B7A4A, lose: #D4483B, surface: #F7F5F0）
- データ層: Zustand stores を `src/stores/` に配置。v0.3で Supabase に差し替え可能な設計
- 状態永続化: Zustand persist middleware → localStorage

## Design Principles

1. 入力は最小限、出力で感動させる（15-20秒で記録完了）
2. 相手情報は任意の付加データ（記録のコアループは相手データなしで成立）
3. タイプ別に入力を最適化（練習/シングルス/ダブルス）
4. データが溜まるほど価値が増す（Hookedモデル）
