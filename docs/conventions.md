# Conventions

コーディング規約・デザイン規約。

## Language & Runtime

- TypeScript (strict mode)
- React 19 + Vite
- Node.js

## Package Management

- npm を使用
- `npm install` で依存インストール

## Styling

- **Tailwind CSS 4** でスタイリング
- **shadcn/ui** コンポーネントライブラリ
- カスタムカラーは Tailwind config で定義

### カラーパレット

| 用途 | カラーコード | 説明 |
|------|------------|------|
| primary | `#1B7A4A` | 芝コートグリーン |
| lose | `#D4483B` | テラコッタ赤（負けは成長の材料） |
| practice | `#D97706` | アンバー（練習） |
| surface | `#F7F5F0` | わずかにベージュの背景 |
| text-primary | `#1A2B1F` | グリーン微量入りの深い色 |

### フォントサイズ

- **最小サイズ: 11px**（`text-[10px]` 禁止）
- スコア・勝率には将来的にモノスペースフォントを導入予定

## State Management

- **Zustand** + persist middleware → localStorage
- ストアは `src/stores/` に配置
- ストア間の直接依存を避ける
- v0.3 で Supabase に差し替え可能な設計

## Component Design

- パスエイリアス: `@/` → `src/`
- ページは `src/pages/` に配置
- 共有コンポーネントは `src/components/` に配置
- shadcn/ui は `src/components/ui/` に配置
- Props には必ず型定義をつける
- `any` 型は使用禁止

## Routing

- React Router v7
- オンボーディング前後でルート分岐
- 記録ページはレイアウト外（FAB + フローティング）

## Design Principles

1. 入力は最小限、出力で感動させる（15-20秒で記録完了）
2. 相手情報は任意の付加データ
3. タイプ別に入力を最適化（練習/シングルス/ダブルス）
4. データが溜まるほど価値が増す

## Commit Convention

- 中途半端な状態をコミットしない。動く状態でコミットする
- `npx tsc --noEmit` PASS を確認してからコミット
