---
name: review-code
description: 実装コードをdesign-direction.mdと照合レビューする時に使う手順
allowed-tools: Read, Grep, Glob, Bash
---

# review-code

実装コードを design-direction.md の方針と照合し、スコアリングする手順。

## 手順

1. **design-direction.md を読む**: `steering/design-direction.md` の該当セクションを読む
2. **実装コードを読む**: 対象ファイルのソースコードを読む
3. **6観点でレビュー**:

### レビュー観点

| # | 観点 | 基準 |
|---|------|------|
| 1 | デザイン方針整合性 | design-direction.md のカラーパレット・レイアウト指示と一致 |
| 2 | 型安全性 | Props型定義、`any` 未使用、適切な型ガード |
| 3 | UX品質 | 空状態、エラー状態、フォントサイズ（最小11px） |
| 4 | コンポーネント設計 | 適切な粒度、再利用性、Props設計 |
| 5 | コード簡潔性 | 不要な抽象化・過度な設計がない |
| 6 | アクセシビリティ | セマンティックHTML、適切なラベル |

4. **各観点を 0-100 でスコアリング**
5. **指摘を分類**: Critical / High / Medium / Low
6. **結果を出力**

## 合格基準

- 全観点で **80点以上**
- **Critical / High の指摘が 0 件**
