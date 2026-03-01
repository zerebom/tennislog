# Agent Guide

エージェント（Teammate）向けの作業ガイド。

## Task Workflow

1. `TaskGet` でタスクの詳細を取得
2. タスクの description に書かれたゴール・手順を確認
3. 実装 or 修正を行う
4. 型チェック・ビルドを実行して全パスを確認
5. `TaskUpdate` で完了報告
6. `SendMessage` でリードに結果を通知

## Commands

```bash
npm run dev          # 開発サーバー起動
npx tsc --noEmit     # 型チェック
npx vite build       # プロダクションビルド
npx serve dist -l 3000 -s  # プロダクションサーバー
```

## Custom Agents

| Agent | 用途 | permissionMode | maxTurns |
|-------|------|----------------|----------|
| feature-implementer | タスク駆動の機能実装 | acceptEdits | 30 |
| code-reviewer | design-direction.md との照合レビュー（読み取り専用） | default | 15 |
| build-tester | 型チェック + ビルド確認 | acceptEdits | 20 |
| code-patrol | 品質パトロール（読み取り専用） | default | 20 |

**注意**: バグ修正には `general-purpose` エージェントを使う。

## Skills

| Skill | 内容 |
|-------|------|
| implement-feature | タスク指示からReactコンポーネントを実装する標準手順 |
| review-code | design-direction.md と照合レビューする手順 |

## Coding Conventions

- パスエイリアス: `@/` → `src/`
- カラーパレット: primary=#1B7A4A, lose=#D4483B, surface=#F7F5F0
- スタイリング: Tailwind CSS 4 + shadcn/ui
- 状態管理: Zustand + persist middleware (localStorage)
- ルーティング: React Router v7
- フォントサイズ最小: 11px（`text-[10px]` 禁止）

## Completion Criteria (共通)

- `npx tsc --noEmit` PASS（型エラーなし）
- `npx vite build` PASS（ビルド成功）
- design-direction.md のカラーパレットに準拠
- 不要な抽象化・過度な設計がない
