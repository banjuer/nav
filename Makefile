# Simple Makefile for a Go project
# 构建版本号：优先从环境变量获取，否则使用时间戳
BUILD_VERSION := $(shell echo $${VITE_BUILD_VERSION:-$$(date +%Y%m%d%H%M%S)})

# Build the application
# all: build test

build:
	@echo "Building UI (version: $(BUILD_VERSION))..."
	@cd ui && VITE_BUILD_VERSION=$(BUILD_VERSION) npm run build
	@echo "Building Go binary..."
	@go build -o van-nav .
	@echo "Build complete: $(BUILD_VERSION)"

# 使用指定版本号构建（用于 Release）
build-release:
	@if [ -z "$(VERSION)" ]; then \
		echo "Error: VERSION is required. Usage: make build-release VERSION=v1.6.0"; \
		exit 1; \
	fi
	@echo "Building release $(VERSION)..."
	@cd ui && VITE_BUILD_VERSION=$(VERSION) npm run build
	@go build -ldflags "-X main.version=$(VERSION)" -o van-nav .
	@echo "Release build complete: $(VERSION)"

build-ui:
	@echo "Building UI (version: $(BUILD_VERSION))..."
	@cd ui && npm run build

build-go:
	@echo "Building Go binary..."
	@go build -o van-nav .

run-ui:
	@cd ./ui/website && pnpm start

run-api:
	@go run .

# Run the application
run:
	@go run .  &
	@cd ./ui && pnpm run start

# Clean the binary
clean:
	@echo "Cleaning..."
	@rm -f main

# 一键构建并运行（前端+后端完整重建）
dev:
	@echo "Building UI and Go binary..."
	@cd ui && npm run build
	@go build -o van-nav .
	@echo "Starting server..."
	@./van-nav

# Live Reload
watch:
	@if command -v air > /dev/null; then \
            air; \
            echo "Watching...";\
        else \
            read -p "Go's 'air' is not installed on your machine. Do you want to install it? [Y/n] " choice; \
            if [ "$$choice" != "n" ] && [ "$$choice" != "N" ]; then \
                go install github.com/air-verse/air@latest; \
                air; \
                echo "Watching...";\
            else \
                echo "You chose not to install air. Exiting..."; \
                exit 1; \
            fi; \
        fi

.PHONY: build run clean watch