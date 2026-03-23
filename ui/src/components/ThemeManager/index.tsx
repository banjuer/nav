import { useState, useEffect } from 'react';
import { BuiltInThemes, ThemeConfig } from '../../themes';
import { Button } from '../ui/Button';
import { CheckIcon, CodeIcon, MixIcon, ColorWheelIcon } from '@radix-ui/react-icons';

interface ThemeManagerProps {
  currentTheme: string;
  customCSS?: string;
  customJS?: string;
  onChange: (theme: string, customCSS?: string, customJS?: string) => void;
}

export const ThemeManager = ({ currentTheme, customCSS = '', customJS = '', onChange }: ThemeManagerProps) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [css, setCss] = useState(customCSS);
  const [js, setJs] = useState(customJS);
  const [activeTab, setActiveTab] = useState<'themes' | 'code'>('themes');

  const currentThemeConfig = BuiltInThemes.find(t => t.id === selectedTheme) || BuiltInThemes[0];

  const handleApply = () => {
    onChange(selectedTheme, css, js);
  };

  return (
    <div className="space-y-6">
      {/* 标签切换 */}
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('themes')}
          className={`flex items-center pb-3 text-sm font-medium transition-colors ${
            activeTab === 'themes'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <ColorWheelIcon className="w-4 h-4 mr-2" />
          主题选择
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center pb-3 text-sm font-medium transition-colors ${
            activeTab === 'code'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <CodeIcon className="w-4 h-4 mr-2" />
          自定义代码
        </button>
      </div>

      {activeTab === 'themes' ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            选择一套内置主题，或切换到「自定义代码」进行深度定制
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BuiltInThemes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                  selectedTheme === theme.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                {selectedTheme === theme.id && (
                  <div className="absolute top-2 right-2 text-blue-500">
                    <CheckIcon className="w-5 h-5" />
                  </div>
                )}
                <h3 className="font-medium text-gray-900 dark:text-white">{theme.name}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{theme.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {theme.styles.layout === 'mobile-app' ? '手机布局' : '网格布局'}
                  </span>
                  {theme.styles.searchBar?.visible ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      搜索框
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      快捷搜索
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            提示：自定义代码会与当前主题的样式合并，可用于覆盖主题默认样式或添加功能。
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              自定义 CSS
            </label>
            <textarea
              rows={6}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm font-mono"
              value={css}
              onChange={e => setCss(e.target.value)}
              placeholder="/* 输入自定义 CSS 样式 */"
            />
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              自定义 JavaScript
            </label>
            <textarea
              rows={6}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm font-mono"
              value={js}
              onChange={e => setJs(e.target.value)}
              placeholder="// 输入自定义 JavaScript 代码"
            />
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={handleApply}>应用设置</Button>
      </div>
    </div>
  );
};

export default ThemeManager;
