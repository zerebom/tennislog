# exe.dev でのデプロイ手順

## exe.dev とは

SSHベースのVM（仮想マシン）ホスティングサービス。VMが約2秒で起動し、`vmname.exe.xyz` でHTTPS公開できる。

- 公式: https://exe.dev/
- ドキュメント: https://exe.dev/docs/all

## 前提条件

- SSH鍵がローカルにセットアップ済み
- exe.dev のアカウント作成済み（`ssh exe.dev` で初回接続時にセットアップ）

## 手順

### 1. VM作成

```bash
ssh exe.dev new tennis-log
```

VMが起動したらSSHで接続:

```bash
ssh tennis-log.exe.dev
```

### 2. 開発環境セットアップ

VM上で必要なランタイムをインストール:

```bash
# Node.js（Next.js/React等を使う場合）
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# または Python（FastAPI等を使う場合）
sudo apt-get install -y python3 python3-pip python3-venv

# DB（SQLite で十分。追加インストール不要）
```

### 3. アプリコードの配置

**方法A: ローカルからrsync**
```bash
rsync -avz ./tennis-log/ tennis-log.exe.dev:~/app/
```

**方法B: VM上でgit clone**
```bash
ssh tennis-log.exe.dev
git clone https://github.com/zerebom/tennis-log.git ~/app
```

**方法C: AIエージェント（Shelley）に生成させる**
exe.dev にはAIコーディングエージェント「Shelley」が組み込まれており、steeringドキュメントの要件・設計をもとにコード生成させることも可能。

### 4. アプリ起動

```bash
ssh tennis-log.exe.dev
cd ~/app

# 例: Next.js の場合
npm install
npm run build
npm start -- -p 3000

# 例: FastAPI の場合
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 3000
```

### 5. HTTPS公開

exe.dev はポート3000へのトラフィックを自動的に `https://tennis-log.exe.xyz/` にプロキシする。TLS証明書も自動管理。

```
https://tennis-log.exe.xyz/
```

基本認証を付けたい場合は exe.dev のドキュメントを参照。

### 6. プロセスの永続化

SSH切断後もアプリを動かし続けるには:

```bash
# systemd サービスとして登録（推奨）
sudo tee /etc/systemd/system/tennis-log.service << 'EOF'
[Unit]
Description=TennisLog App
After=network.target

[Service]
WorkingDirectory=/home/user/app
ExecStart=/usr/bin/npm start -- -p 3000
Restart=always
User=user

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable tennis-log
sudo systemctl start tennis-log
```

または簡易的に:
```bash
nohup npm start -- -p 3000 &
```

## steeringドキュメントの活用

exe.dev の Shelley や Claude Code でコード生成する際、以下を入力として渡す:

1. `requirements.md` - ターゲットユーザー、バーニングニーズ、競合分析
2. `design.md` - MVP機能スコープ、記録フロー、スコープ外
3. `workflows.md` - 各画面のワークフロー詳細
4. `mock.html` - UIモック

## 次のアクション

- [ ] exe.dev アカウント作成（`ssh exe.dev`）
- [ ] MVP実装（P0機能のみ）
- [ ] `tennis-log.exe.xyz` でデプロイ確認
- [ ] テニス仲間に共有してフィードバック収集
