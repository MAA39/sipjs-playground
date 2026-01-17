# SIP.js Playground

SIP.jsでSIP電話クライアントを作る練習用リポジトリ

## セットアップ

```bash
# クローン
git clone https://github.com/MAA39/sipjs-playground.git
cd sipjs-playground

# 依存関係インストール
pnpm install

# 開発サーバー起動
pnpm dev
```

## 動かすには

⚠️ **Asterisk（SIPサーバー）が必要です**

このクライアントを実際に動かすには、SIPサーバー（Asterisk）が必要。
詳細は「SIP.jsでSIP電話を作る本」の第2章を参照。

### 簡易テスト（Asteriskなし）

著者が提供しているデモページで接続テストできる：
https://denwaya34.github.io/sipjs-simple-user-react-example/

## 参考資料

- [SIP.js 公式](https://sipjs.com/)
- [SIP.js GitHub](https://github.com/onsip/SIP.js)
- [Asterisk 公式](https://www.asterisk.org/)