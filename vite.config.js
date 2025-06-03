import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
  server: {
    open: true,
    proxy: {
      // '/api'로 시작하는 모든 요청을 http://localhost:8080 (백엔드 서버 주소)으로 전달
      '/api': {
        target: 'http://localhost:8080', // 실제 백엔드 서버 주소 및 포트
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '') // 필요에 따라 경로 재작성
      }
    }
  },
})
