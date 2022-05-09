FROM node:16-bullseye-slim

COPY ./package.json /VuePressAdmin/package.json
COPY ./app /VuePressAdmin/app
COPY ./config /VuePressAdmin/config
COPY ./initDatabase.js /VuePressAdmin/initDatabase.js
COPY ./start.sh /VuePressAdmin/start.sh

WORKDIR /VuePressAdmin

EXPOSE 7001

VOLUME /VuePressAdmin/database
VOLUME /VuePressAdmin/shellOutput

RUN mkdir /shellOutput \
    && chmod 777 /shellOutput \
    && npm install \
    && apt update \
    && apt install -y curl \
    && apt install -y debian-keyring debian-archive-keyring apt-transport-https \
    && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | tee /etc/apt/trusted.gpg.d/caddy-stable.asc \
    && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list \
    && apt update \
    && apt install -y caddy

CMD ["sh", "start.sh"]
