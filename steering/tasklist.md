# TennisLog - Tasklist

## v0.1 MVP（exe.dev でデプロイ）

### Phase 1: プロジェクト初期化
- [ ] Vite + React 19 + Tailwind CSS 4 + shadcn/ui でプロジェクト作成
- [ ] Zustand + persist middleware セットアップ
- [ ] React Router v7 セットアップ（/, /persons, /persons/:id, /stats, /onboarding）
- [ ] 共通レイアウト（ボトムタブ: ホーム / 仲間 / 統計、FAB）
- [ ] vite-plugin-pwa 初期設定

### Phase 2: データ層
- [ ] useActivityStore（Match + Practice の CRUD、勝率計算、月間集計）
- [ ] usePersonStore（Person CRUD、相手・パートナー共通、検索）
- [ ] useProfileStore（ニックネーム、テニス歴、オンボーディング状態）
- [ ] useInsightStore（記録後インサイト生成ロジック、データ蓄積量に応じた出し分け）

### Phase 3: コア画面
- [ ] オンボーディング（ウェルカム → プロフィール → 初回記録誘導）
- [ ] 記録タイプ選択（🏋️ 練習・レッスン / 🎾 シングルス / 🎾🎾 ダブルス）
- [ ] シングルス記録フォーム（スコア → 調子 → 相手(任意) → メモ(任意)）
- [ ] ダブルス記録フォーム（スコア → 調子 → パートナー(任意) → メモ(任意)）
- [ ] 練習記録フォーム（タグ選択 → 調子 → メモ(任意)）
- [ ] バッチ記録（1日複数試合の一括入力、テニスベアイベント向け）
- [ ] 記録完了後インサイト表示（データ蓄積量に応じて変化）
- [ ] 対戦相手/パートナー新規登録ボトムシート（名前だけで5秒登録）
- [ ] ホーム: タイムライン（試合+練習の統合カード一覧）
- [ ] ホーム: カレンダー表示（月間の活動可視化）
- [ ] ホーム: 自己評価（😤😐😊）推移グラフ
- [ ] ホーム: 自動集計（月間試合数、勝率、練習回数）
- [ ] 仲間一覧（/persons）
- [ ] Head-to-Head 詳細（/persons/:id、通算成績、直近傾向）
- [ ] 相手レベル提案（同じ相手と2回対戦後に主観3段階を提案）

### Phase 4: 仕上げ・デプロイ
- [ ] PWA 対応（vite-plugin-pwa、アイコン、manifest）
- [ ] モック（mock.html）のデザイントークンを実装に反映
- [ ] exe.dev VM作成（`ssh exe.dev new`）、Node.js インストール
- [ ] `vite build` → `npx serve dist/` で配信（exe.dev が HTTPS 自動付与）
- [ ] 共有リンク発行してモバイル実機テスト（iPhone Safari、Android Chrome）

---

## v0.2（P1: リリース後）
- [ ] 月次サマリー（今月の試合数/勝率/練習回数、先月比較、よく組んだパートナー）
- [ ] スキルタグ（試合記録時に「良かった/課題」をタップ式で追加）
- [ ] マイルストーン通知（格上初勝利、連勝、勝率アップ、通算N試合達成）
- [ ] データエクスポート（JSON）

## v0.3（友達機能 + Supabase）
- [ ] Supabase 導入（Auth + DB + Realtime）
- [ ] Zustand persist → Supabase sync に差し替え
- [ ] ユーザー登録・ログイン（Google / Apple）
- [ ] localStorage → Supabase マイグレーション機能
- [ ] QRコード友達追加（WF-5 Phase 2）
- [ ] 友達タイムライン（WF-5 Phase 3）

## v1.0（P2: 検証後）
- [ ] 詳細スキル評価（5項目5段階、時系列可視化）
- [ ] 練習→試合の因果分析（「ボレー練習を増やした月→ネットプレー好調」等）
- [ ] レッスン代ROI可視化
