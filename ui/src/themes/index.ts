import { DefaultTheme } from './default';
import { MobileAppTheme } from './mobile-app';

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  type: 'built-in' | 'custom';
  preview?: string;
  styles: {
    layout: 'default' | 'mobile-app' | 'grid';
    container?: string;
    card?: string;
    searchBar?: {
      visible: boolean;
      style: 'default' | 'floating' | 'minimal';
      position: 'top' | 'center' | 'hidden';
    };
  };
  customCSS?: string;
  customJS?: string;
}

export const BuiltInThemes: ThemeConfig[] = [
  DefaultTheme,
  MobileAppTheme,
];

export function getThemeById(id: string): ThemeConfig {
  return BuiltInThemes.find(t => t.id === id) || DefaultTheme;
}
