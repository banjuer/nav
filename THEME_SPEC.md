# 主题管理规范

## 1. 主题配置结构

```typescript
interface Theme {
  id: string;              // 主题唯一标识
  name: string;            // 主题名称
  description: string;     // 主题描述
  type: 'built-in' | 'custom';  // 内置或自定义
  
  // 样式配置
  styles: {
    // 布局类型
    layout: 'default' | 'mobile-app' | 'custom';
    
    // 颜色配置
    colors: {
      primary: string;
      background: string;
      card: string;
      text: string;
      border: string;
    };
    
    // 卡片样式
    card: {
      borderRadius: string;
      shadow: string;
      hoverEffect: string;
    };
    
    // 搜索框配置
    searchBar: {
      visible: boolean;
      style: 'default' | 'floating' | 'minimal';
      position: 'top' | 'center' | 'hidden';
    };
  };
  
  // 自定义代码（从原 setting 迁移）
  customCSS?: string;
  customJS?: string;
}
```

## 2. 内置主题

### 2.1 默认主题 (default)
- 当前网格卡片布局
- 搜索框在顶部
- 分类标签横向排列

### 2.2 手机APP主题 (mobile-app)
- 手机风格图标网格
- 图标下方显示标题
- 搜索框隐藏（保留快捷搜索）
- 整体风格模拟手机桌面

## 3. 图标管理
- 支持 URL 或本地 base64 存储
- 优先使用本地图标
- 自动缓存外部图标
