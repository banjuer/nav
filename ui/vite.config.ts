import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// 生成构建版本号：优先从环境变量获取，否则使用时间戳
// 环境变量 VITE_BUILD_VERSION 可用于 CI/CD（如 GitHub Actions）指定版本
const buildVersion = process.env.VITE_BUILD_VERSION || 
                     new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        'import.meta.env.VITE_BUILD_VERSION': JSON.stringify(buildVersion),
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
