import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'child_process'

// 获取当前 git tag 作为版本号，如果没有 tag 则使用 commit hash
function getVersion() {
    try {
        // 优先从环境变量获取（用于 CI/CD）
        if (process.env.VITE_APP_VERSION) {
            return process.env.VITE_APP_VERSION
        }
        // 尝试获取最新的 git tag
        const tag = execSync('git describe --tags --abbrev=0', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim()
        return tag
    } catch (e) {
        // 没有 tag 时使用 commit hash
        try {
            const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
            return `dev-${hash}`
        } catch {
            return 'dev-unknown'
        }
    }
}

// 生成构建版本号：优先从环境变量获取，否则使用时间戳
// 环境变量 VITE_BUILD_VERSION 可用于 CI/CD（如 GitHub Actions）指定版本
const buildVersion = process.env.VITE_BUILD_VERSION || 
                     new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)

const appVersion = getVersion()

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        'import.meta.env.VITE_BUILD_VERSION': JSON.stringify(buildVersion),
        'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    },
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:6412',
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: 'build', // Maintain compatibility with existing deployment scripts if any
    },
})
