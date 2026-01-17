FROM --platform=linux/amd64 ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV ASTERISK_VERSION=22.4.1

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    wget \
    curl \
    libssl-dev \
    libncurses5-dev \
    libnewt-dev \
    libxml2-dev \
    linux-headers-generic \
    libsqlite3-dev \
    uuid-dev \
    libjansson-dev \
    xmlstarlet \
    libedit-dev \
    pkg-config \
    libsrtp2-dev \
    libopus-dev \
    libvorbis-dev \
    libasound2-dev \
    portaudio19-dev \
    libcurl4-openssl-dev \
    libiksemel-dev \
    libspeex-dev \
    libspeexdsp-dev \
    libpq-dev \
    unixodbc-dev \
    libmyodbc \
    libldap2-dev \
    liblua5.2-dev \
    libogg-dev \
    libresample1-dev \
    libunbound-dev \
    libfftw3-dev \
    libsndfile1-dev \
    subversion \
    git \
    && rm -rf /var/lib/apt/lists/*

# Asteriskをダウンロード・ビルド
WORKDIR /usr/src
RUN wget https://downloads.asterisk.org/pub/telephony/asterisk/old-releases/asterisk-${ASTERISK_VERSION}.tar.gz \
    && tar -xzf asterisk-${ASTERISK_VERSION}.tar.gz \
    && cd asterisk-${ASTERISK_VERSION} \
    && ./contrib/scripts/install_prereq install \
    && ./configure --with-pjproject-bundled \
    && make menuselect.makeopts \
    && menuselect/menuselect \
        --enable codec_opus \
        --enable CORE-SOUNDS-EN-WAV \
        --enable CORE-SOUNDS-EN-G722 \
        menuselect.makeopts \
    && make -j$(nproc) \
    && make install \
    && make samples \
    && rm -rf /usr/src/asterisk-*

# 証明書ディレクトリ作成
RUN mkdir -p /etc/asterisk/keys

# 設定ファイルをコピー（後でマウントする）
COPY asterisk/http.conf /etc/asterisk/http.conf
COPY asterisk/pjsip.conf /etc/asterisk/pjsip.conf
COPY asterisk/extensions.conf /etc/asterisk/extensions.conf

# ポート公開
# 8088: HTTP
# 8089: HTTPS (WSS)
# 5060: SIP UDP
# 10000-20000: RTP
EXPOSE 8088 8089 5060/udp 10000-20000/udp

# 起動
CMD ["asterisk", "-f"]
