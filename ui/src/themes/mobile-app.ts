import { ThemeConfig } from './index';

export const MobileAppTheme: ThemeConfig = {
  id: 'mobile-app',
  name: '手机APP风格',
  description: '模拟手机桌面布局，图标+标题，简洁清爽',
  type: 'built-in',
  styles: {
    layout: 'mobile-app',
    container: 'container mx-auto px-4 py-6 max-w-md',
    card: 'flex flex-col items-center justify-center p-3 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 dark:bg-gray-800/80',
    searchBar: {
      visible: false,  // 隐藏搜索框，保留快捷搜索
      style: 'minimal',
      position: 'hidden',
    },
  },
  customCSS: `
    /* 手机APP风格自定义样式 */
    .van-layout-root {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    .dark .van-layout-root {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }
    .van-layout-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      padding: 1rem 0;
    }
    @media (min-width: 640px) {
      .van-layout-grid {
        grid-template-columns: repeat(5, 1fr);
      }
    }
    .van-card-icon {
      width: 56px !important;
      height: 56px !important;
      border-radius: 14px !important;
      margin-bottom: 0.5rem !important;
      margin-right: 0 !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .van-card-title {
      font-size: 11px !important;
      text-align: center !important;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100% !important;
    }
    .van-card-desc,
    .van-card-catelog {
      display: none !important;
    }
    .van-card-index {
      display: none !important;
    }
  `,
};
