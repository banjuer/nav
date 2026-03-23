import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UpdateIcon, CheckIcon } from '@radix-ui/react-icons';

export interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

// 版本检查组件
const VersionBadge: React.FC = () => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkVersion();
  }, []);

  const checkVersion = async () => {
    try {
      const response = await fetch('https://api.github.com/repos/banjuer/nav/releases/latest', {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      const latestVersion = data.tag_name || '';
      const currentVersion = import.meta.env.VITE_APP_VERSION || 'unknown';
      
      const current = currentVersion.replace(/^v/, '');
      const latest = latestVersion.replace(/^v/, '');
      
      if (latest && current) {
        const parts1 = latest.split('.').map(Number);
        const parts2 = current.split('.').map(Number);
        let hasNewer = false;
        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
          const a = parts1[i] || 0;
          const b = parts2[i] || 0;
          if (a > b) { hasNewer = true; break; }
          if (a < b) break;
        }
        setHasUpdate(hasNewer);
      }
    } catch (err) {
      console.error('版本检查失败:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <span className="text-gray-400 flex items-center gap-1"><UpdateIcon className="w-3 h-3 animate-spin" /></span>;
  }

  if (hasUpdate) {
    return (
      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
        <UpdateIcon className="w-3 h-3" />
        有更新
      </span>
    );
  }

  return (
    <span className="text-green-600 dark:text-green-400 flex items-center gap-0.5">
      <CheckIcon className="w-3 h-3" />
      最新
    </span>
  );
};

interface SidebarProps {
  items: MenuItem[];
  currentKey: string;
  onChange: (key: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  currentKey,
  onChange
}) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`h-full bg-white border-r border-gray-200 transition-all duration-300 relative dark:bg-gray-800 dark:border-gray-700
      ${expanded ? 'w-64' : 'w-20'}`}>
      <nav className="pt-4 relative h-full">
        {items.map((item) => (
          <Link
            key={item.key}
            to={item.path}
            onClick={() => onChange(item.key)}
            className={`
              flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer no-underline dark:text-gray-300 dark:hover:bg-gray-700
              border-l-4 
              ${(currentKey === item.key || location.pathname === item.path)
                ? 'bg-gray-100 border-blue-500 dark:bg-gray-700 dark:border-blue-400'
                : 'border-transparent'}
            `}
          >
            <span className="text-xl">{item.icon}</span>
            {expanded && <span className="ml-3 truncate">{item.label}</span>}
          </Link>
        ))}
        <button
          onClick={() => setExpanded(!expanded)}
          className="absolute bottom-5 -right-3 p-2 hover:bg-gray-100 rounded-full 
          bg-white border border-gray-200 shadow-sm z-50 w-6 h-6 
          flex items-center justify-center text-sm dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-300"
        >
          {expanded ? '←' : '→'}
        </button>

        {/* GitHub & Version Info */}
        <a
          href="https://github.com/banjuer/nav"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 left-4 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white group"
          title="GitHub"
        >
          <svg height="20" width="20" viewBox="0 0 16 16" className="fill-current flex-shrink-0">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          {expanded && (
            <div className="ml-3 flex flex-col text-[10px] leading-tight">
              <span className="font-medium">{import.meta.env.VITE_APP_VERSION || 'unknown'}</span>
              <VersionBadge />
            </div>
          )}
        </a>
      </nav>
    </div>
  );
};