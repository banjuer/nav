import { ThemeConfig } from './index';

export const DefaultTheme: ThemeConfig = {
  id: 'default',
  name: '默认主题',
  description: '经典的网格卡片布局，适合桌面和移动设备',
  type: 'built-in',
  styles: {
    layout: 'default',
    container: 'container mx-auto px-4 max-w-7xl',
    card: 'group relative flex w-full cursor-pointer flex-col items-center p-4 rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800 sm:flex-row sm:items-center sm:text-left',
    searchBar: {
      visible: true,
      style: 'default',
      position: 'top',
    },
  },
};
