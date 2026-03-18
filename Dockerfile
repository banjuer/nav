FROM node:24-alpine AS frontendbuilder
WORKDIR /app
# 添加缓存失效标记 - 每次构建时修改这个值可以强制重新构建前端
ARG CACHE_BUSTER=1
COPY . .
RUN npm install -g pnpm
# 使用 --force 确保重新安装依赖，避免缓存问题
RUN cd /app/ui && pnpm install --force && CI=false pnpm build && cd ..

FROM golang:1.25-alpine AS binarybuilder
RUN apk --no-cache --no-progress add  git
WORKDIR /app
COPY --from=frontendbuilder /app/ /app/
RUN cd /app && ls -la && go mod tidy && go build .


FROM alpine:latest
ENV TZ="Asia/Shanghai"
RUN apk --no-cache --no-progress add \
    ca-certificates \
    tzdata && \
    cp "/usr/share/zoneinfo/$TZ" /etc/localtime && \
    echo "$TZ" >  /etc/timezone
WORKDIR /app
COPY --from=binarybuilder /app/nav /app/

VOLUME ["/app/data"]
EXPOSE 6412
ENTRYPOINT [ "/app/nav" ]