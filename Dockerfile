FROM node:20-alpine AS frontendbuilder
WORKDIR /app
# 添加缓存失效标记
ARG CACHE_BUSTER=1
COPY . .
RUN npm install -g pnpm

# 前端构建 - 关键步骤
RUN echo "=== Starting frontend build ===" && \
    cd /app/ui && \
    pnpm install --force && \
    CI=false pnpm build && \
    cd .. && \
    echo "=== Frontend build completed ===" && \
    ls -la /app/ui/build/ && \
    echo "=== index.html first 20 lines ===" && \
    head -20 /app/ui/build/index.html

FROM golang:1.23-alpine AS binarybuilder
RUN apk --no-cache --no-progress add git
WORKDIR /app

# 关键：复制前端构建结果
COPY --from=frontendbuilder /app/ui/build /app/ui/build
COPY --from=frontendbuilder /app/main.go /app/
COPY --from=frontendbuilder /app/serve.go /app/
COPY --from=frontendbuilder /app/go.mod /app/
COPY --from=frontendbuilder /app/go.sum /app/
COPY --from=frontendbuilder /app/utils /app/utils
COPY --from=frontendbuilder /app/handler /app/handler
COPY --from=frontendbuilder /app/middleware /app/middleware
COPY --from=frontendbuilder /app/database /app/database
COPY --from=frontendbuilder /app/logger /app/logger
COPY --from=frontendbuilder /app/types /app/types
COPY --from=frontendbuilder /app/service /app/service
COPY --from=frontendbuilder /app/goscraper /app/goscraper

# 验证文件
RUN echo "=== Files before Go build ===" && \
    ls -la /app/ui/build/ && \
    ls -la /app/*.go && \
    echo "=== main.go embed directive ===" && \
    grep -A1 "go:embed" /app/main.go

# Go 构建
RUN cd /app && \
    go mod tidy && \
    go build -v -o nav . && \
    echo "=== Binary built ===" && \
    ls -lh /app/nav

FROM alpine:latest
ENV TZ="Asia/Shanghai"
RUN apk --no-cache --no-progress add \
    ca-certificates \
    tzdata && \
    cp "/usr/share/zoneinfo/$TZ" /etc/localtime && \
    echo "$TZ" > /etc/timezone
WORKDIR /app
COPY --from=binarybuilder /app/nav /app/
RUN ls -lh /app/nav

VOLUME ["/app/data"]
EXPOSE 6412
ENTRYPOINT [ "/app/nav" ]
