import { useState, useEffect, useMemo } from "react";
import { clsx } from "clsx";
import { useNavigate } from "react-router-dom";

interface LoginButtonProps {
  showGithub: boolean;
}

const LoginButton = ({ showGithub }: LoginButtonProps) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 检查登录状态
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = window.localStorage.getItem("_token");
      setIsLoggedIn(!!token);
    };

    // 初始检查
    checkLoginStatus();

    // 监听 storage 事件（跨标签页）
    window.addEventListener("storage", checkLoginStatus);
    // 自定义事件用于同一页面内更新
    window.addEventListener("auth-change", checkLoginStatus);
    // 页面可见性变化时检查（从后台返回前台时）
    document.addEventListener("visibilitychange", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("auth-change", checkLoginStatus);
      document.removeEventListener("visibilitychange", checkLoginStatus);
    };
  }, []);

  const handleClick = () => {
    if (isLoggedIn) {
      navigate("/admin");
    } else {
      navigate("/login");
    }
  };

  // 计算底部位置
  // 从下到上: GithubLink -> DarkSwitch -> LoginButton -> AddToolButton(最上)
  const bottomPosition = useMemo(() => {
    if (showGithub) {
      // GithubLink(bottom-3=12px) + 间距(16px) + DarkSwitch(40px) + 间距(16px) = 84px
      // 为了让登录按钮在 DarkSwitch 之上，使用 bottom-[104px] (手机) / bottom-[120px] (桌面)
      return "bottom-[104px] md:bottom-[120px]";
    }
    // DarkSwitch(bottom-[56px]) + 间距(16px) = 72px -> 使用 104px 对齐
    return "bottom-[56px] md:bottom-[72px]";
  }, [showGithub]);

  return (
    <div
      className={clsx(
        "fixed right-3 z-[56] flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur transition-all hover:bg-white hover:shadow-md dark:bg-gray-800/80 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200",
        bottomPosition
      )}
      onClick={handleClick}
      title={isLoggedIn ? "进入管理后台" : "登录"}
    >
      {isLoggedIn ? (
        // 已登录状态 - 用户图标
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path
            fillRule="evenodd"
            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        // 未登录状态 - 登录图标
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path
            fillRule="evenodd"
            d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm5.03 4.72a.75.75 0 010 1.06l-1.72 1.72h10.94a.75.75 0 010 1.5H10.81l1.72 1.72a.75.75 0 11-1.06 1.06l-3-3a.75.75 0 010-1.06l3-3a.75.75 0 011.06 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );
};

export default LoginButton;
