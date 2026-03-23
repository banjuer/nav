# ⚠️ 警告：请先阅读本文档再修改代码！

> **本项目的构建流程有陷阱**：前端代码嵌入到 Go 二进制中，修改后需要完整重新编译，不是简单的 `go run .` 能解决的。
> 
> 如果你正在修复前端 Bug，请务必阅读下方的【关键构建流程】部分！

---

# 项目开发指南

## 技术栈
- 后端：Go (Gin 框架)
- 前端：React + TypeScript + Tailwind CSS + Vite
- 前端构建后嵌入到 Go 二进制中

## 关键构建流程 ⚠️

**重要**：Go 代码使用 `//go:embed ui/build` 在**编译时**嵌入前端静态文件，因此：

### 修改前端代码后
```bash
cd ui && npm run build && cd .. && go build -o van-nav . && ./van-nav
```

### 只修改后端代码
```bash
go build -o van-nav . && ./van-nav
```

### 开发调试（前端独立运行）
```bash
cd ui && npm run dev  # 启动 Vite 开发服务器，热更新
```

## 常见陷阱
- ❌ 错误：`npm run build` 后直接 `go run .` → 运行的是旧嵌入文件
- ✅ 正确：必须重新执行 `go build` 才能打包新的前端构建

## 项目结构
- `ui/src/` - React 前端源码
- `ui/build/` - 前端构建输出（被嵌入到 Go）
- `handler/` - Go HTTP 处理器
- `database/` - SQLite 数据库操作
- `service/` - 业务逻辑
- `main.go` - 程序入口

## 版本管理 ⚠️

本项目使用 **Git Tag** 作为版本号，后台会自动检查 GitHub Releases 更新。

### 发布新版本流程
1. 更新代码并提交到 main 分支
2. 打标签（版本号格式：`v{主版本}.{次版本}.{修订}`，如 `v1.7.2`）：
   ```bash
   git tag -a v1.7.2 -m "版本说明"
   git push origin v1.7.2
   ```
3. GitHub Actions 会自动构建并发布 Docker 镜像

### 版本号规则
- 主版本号：重大功能变更或破坏性更新
- 次版本号：新增功能或较大改进
- 修订号：Bug 修复或小的优化

### 技术实现
- 版本号来源：`git describe --tags`（vite.config.ts 自动获取）
- 前端显示：`import.meta.env.VITE_APP_VERSION`
- 更新检查：调用 GitHub API (`repos/banjuer/nav/releases/latest`)
- 后台位置：左下角固定显示当前版本和更新状态
