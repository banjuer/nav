import { useState, useEffect } from 'react';
import { GitHubLogoIcon, UpdateIcon, CheckIcon } from '@radix-ui/react-icons';

interface VersionInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseUrl: string;
}

export const VersionCheck = () => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const currentVersion = import.meta.env.VITE_APP_VERSION || 'unknown';

  useEffect(() => {
    checkVersion();
  }, []);

  const checkVersion = async () => {
    try {
      setLoading(true);
      setError(false);
      
      // 调用 GitHub API 获取最新 release
      const response = await fetch('https://api.github.com/repos/banjuer/nav/releases/latest', {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch latest version');
      }
      
      const data = await response.json();
      const latestVersion = data.tag_name || '';
      
      // 比较版本号（移除 v 前缀后比较）
      const current = currentVersion.replace(/^v/, '');
      const latest = latestVersion.replace(/^v/, '');
      
      const hasUpdate = latest && current && compareVersions(latest, current) > 0;
      
      setVersionInfo({
        currentVersion,
        latestVersion,
        hasUpdate,
        releaseUrl: data.html_url || 'https://github.com/banjuer/nav/releases'
      });
    } catch (err) {
      console.error('版本检查失败:', err);
      setError(true);
      setVersionInfo({
        currentVersion,
        latestVersion: '',
        hasUpdate: false,
        releaseUrl: 'https://github.com/banjuer/nav/releases'
      });
    } finally {
      setLoading(false);
    }
  };

  // 简单的版本号比较函数
  const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const a = parts1[i] || 0;
      const b = parts2[i] || 0;
      if (a > b) return 1;
      if (a < b) return -1;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <UpdateIcon className="w-3 h-3 mr-1 animate-spin" />
        检查版本中...
      </div>
    );
  }

  if (error || !versionInfo) {
    return (
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <span>当前版本: {currentVersion}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <GitHubLogoIcon className="w-3 h-3 mr-1" />
        <span>当前版本: {versionInfo.currentVersion}</span>
        {versionInfo.hasUpdate ? (
          <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] dark:bg-amber-900/30 dark:text-amber-400">
            有新版本
          </span>
        ) : (
          <span className="ml-2 flex items-center text-green-600 dark:text-green-400">
            <CheckIcon className="w-3 h-3 mr-0.5" />
            最新
          </span>
        )}
      </div>
      
      {versionInfo.hasUpdate && (
        <div className="text-[11px] text-gray-500 dark:text-gray-400">
          发现新版本: 
          <a 
            href={versionInfo.releaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            {versionInfo.latestVersion}
          </a>
        </div>
      )}
    </div>
  );
};

export default VersionCheck;
