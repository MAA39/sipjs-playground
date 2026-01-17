#!/bin/bash
# 自己署名証明書を生成するスクリプト

KEYS_DIR="./asterisk/keys"
mkdir -p $KEYS_DIR

# 秘密鍵生成
openssl genrsa -out $KEYS_DIR/asterisk.key 2048

# 証明書生成（365日有効）
openssl req -new -x509 -days 365 \
    -key $KEYS_DIR/asterisk.key \
    -out $KEYS_DIR/asterisk.crt \
    -subj "/CN=localhost/O=SIPjs Playground/C=JP"

echo "証明書を生成しました:"
ls -la $KEYS_DIR/
