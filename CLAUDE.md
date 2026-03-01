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

## AI Agent Architecture

### Lead Role

リード（メインセッション）はタスク設計と管理だけを行う。コードは書かない。
詳細: `docs/lead-role.md`

### Session Startup Checklist

1. steering/ 配下の全ファイルを確認
2. `steering/issues.md` を読んで未解決の問題を把握
3. `steering/tasklist.md` を読んで現在のPhaseを特定
4. git status で未コミットの変更を確認
5. 即座に次のアクションに着手する（人間に「進めますか？」と聞かない）

### Custom Agents

| Agent | 用途 | Mode |
|-------|------|------|
| feature-implementer | 機能実装 | acceptEdits |
| code-reviewer | デザイン照合レビュー（読み取り専用） | default |
| build-tester | 型チェック + ビルド | acceptEdits |
| code-patrol | 品質パトロール（読み取り専用） | default |

### Skills

- `implement-feature`: React コンポーネント実装手順
- `review-code`: design-direction.md との照合レビュー手順

### Key Documents

- `steering/issues.md` - 課題追跡（最重要。ここが作業の起点）
- `steering/design-direction.md` - デザイン方針
- `docs/conventions.md` - コーディング規約
- `docs/agent-guide.md` - エージェント作業ガイド
- `docs/lead-role.md` - リードの行動規範
