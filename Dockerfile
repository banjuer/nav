FROM node:24-alpine AS frontendbuilder
WORKDIR /app
# 添加缓存失效标记 - 必须放在 COPY 之前才能生效
ARG CACHE_BUSTER=1
COPY . .
RUN npm install -g pnpm
# 使用 --force 确保重新安装依赖，避免缓存问题
RUN cd /app/ui && pnpm install --force && CI=false pnpm build && cd ..
# 验证前端构建输出
RUN echo "=== Frontend build output ===" && \
    ls -la /app/ui/build/ && \
    echo "=== index.html content ===" && \
    cat /app/ui/build/index.html | head -10 && \
    echo "=== Check for specific file (Home-*.js) ===" && \
    ls -la /app/ui/build/assets/ | grep -E "Home|ContextMenu" | head -5

FROM golang:1.25-alpine AS binarybuilder
RUN apk --no-cache --no-progress add git
WORKDIR /app
# 清理 Go 缓存，确保重新构建
RUN go clean -cache -modcache -testcache
COPY --from=frontendbuilder /app/ /app/
# 验证嵌入文件存在
RUN echo "=== Files copied to binarybuilder ===" && \
    ls -la /app/ui/build/ && \
    echo "=== Home.js content check ===" && \
    ls -la /app/ui/build/assets/ | grep -i home && \
    echo "=== main.go embed path check ===" && \
    grep -A2 "go:embed" /app/main.go
# 强制重新构建，不使用缓存
RUN cd /app && go mod tidy && go build -a -v -o nav .
# 验证二进制文件包含嵌入文件（通过检查大小）
RUN echo "=== Final binary size ===" && \
    ls -lh /app/nav && \
    echo "=== Binary should be > 10MB if frontend is embedded ==="

FROM alpine:latest
ENV TZ="Asia/Shanghai"
RUN apk --no-cache --no-progress add \
    ca-certificates \
    tzdata && \
    cp "/usr/share/zoneinfo/$TZ" /etc/localtime && \
    echo "$TZ" > /etc/timezone
WORKDIR /app
COPY --from=binarybuilder /app/nav /app/
# 验证最终镜像中的二进制
RUN ls -lh /app/nav

VOLUME ["/app/data"]
EXPOSE 6412
ENTRYPOINT [ "/app/nav" ]
