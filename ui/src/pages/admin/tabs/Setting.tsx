import { useCallback, useEffect, useState } from "react";
import { fetchUpdateSetting, fetchUpdateUser } from "../../../utils/api";
import { useData } from "../hooks/useData";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Switch } from "../../../components/ui/Switch";
import { Loading } from "../../../components/Loading";
import { ToolLogo } from "../../../components/ToolLogo";

import toast from "react-hot-toast";

export const Setting = () => {
  const { store, loading, reload } = useData();
  const [userData, setUserData] = useState<any>({});
  const [settingData, setSettingData] = useState<any>({});
  const [requestLoading, setRequestLoading] = useState(false);
  const [logoMode, setLogoMode] = useState<"url" | "upload">("url");
  const [tempUrl, setTempUrl] = useState("");
  const [logo192Mode, setLogo192Mode] = useState<"url" | "upload">("url");
  const [tempLogo192Url, setTempLogo192Url] = useState("");
  const [logo512Mode, setLogo512Mode] = useState<"url" | "upload">("url");
  const [tempLogo512Url, setTempLogo512Url] = useState("");

  useEffect(() => {
    if (store?.user) setUserData(store.user);
    if (store?.setting) {
      setSettingData(store.setting);
      // 初始化logo模式
      if (store.setting.favicon?.startsWith("data:")) {
        setLogoMode("upload");
        setTempUrl("");
      } else {
        setLogoMode("url");
        setTempUrl(store.setting.favicon || "");
      }
      // 初始化logo192模式
      if (store.setting.logo192?.startsWith("data:")) {
        setLogo192Mode("upload");
        setTempLogo192Url("");
      } else {
        setLogo192Mode("url");
        setTempLogo192Url(store.setting.logo192 || "");
      }
      // 初始化logo512模式
      if (store.setting.logo512?.startsWith("data:")) {
        setLogo512Mode("upload");
        setTempLogo512Url("");
      } else {
        setLogo512Mode("url");
        setTempLogo512Url(store.setting.logo512 || "");
      }
    }
  }, [store])

  const handleUpdateUser = useCallback(
    async () => {
      if (!userData.name || !userData.password) {
        toast.error("请输入用户名和密码");
        return;
      }
      setRequestLoading(true);
      try {
        await fetchUpdateUser({ ...userData, id: store?.user?.id });
        toast.success("修改成功!");
        reload();
      } catch (err: any) {
        toast.error(err.message || "修改失败!");
      } finally {
        setRequestLoading(false);
      }
    },
    [userData, store, reload]
  );

  const handleFileUpload = (field: "favicon" | "logo192" | "logo512") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
      toast.error("文件大小不能超过 100KB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (result) => {
      setSettingData({ ...settingData, [field]: result.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleManualUrlChange = (field: "favicon" | "logo192" | "logo512") => (val: string) => {
    if (field === "favicon") {
      setTempUrl(val);
    } else if (field === "logo192") {
      setTempLogo192Url(val);
    } else if (field === "logo512") {
      setTempLogo512Url(val);
    }
    setSettingData({ ...settingData, [field]: val });
  };

  const handleLogoModeChange = (modeField: "logoMode" | "logo192Mode" | "logo512Mode", urlField: "favicon" | "logo192" | "logo512", tempUrlField: string) => (val: any) => {
    if (modeField === "logoMode") {
      setLogoMode(val);
      if (val === "url") {
        setSettingData((prev: any) => ({ ...prev, [urlField]: tempUrl }));
      }
    } else if (modeField === "logo192Mode") {
      setLogo192Mode(val);
      if (val === "url") {
        setSettingData((prev: any) => ({ ...prev, [urlField]: tempLogo192Url }));
      }
    } else if (modeField === "logo512Mode") {
      setLogo512Mode(val);
      if (val === "url") {
        setSettingData((prev: any) => ({ ...prev, [urlField]: tempLogo512Url }));
      }
    }
  };

  const handleUpdateWebSite = useCallback(
    async () => {
      setRequestLoading(true);
      try {
        await fetchUpdateSetting(settingData);
        toast.success("修改成功!");
        reload();
      } catch (err: any) {
        toast.error(err.message || "修改失败!");
      } finally {
        setRequestLoading(false);
      }
    },
    [settingData, reload]
  );

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h2 className="mb-6 text-lg font-medium text-gray-900 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700">修改用户信息</h2>
        <div className="space-y-4 max-w-lg">
          <Input
            label="用户名"
            value={userData.name || ''}
            onChange={e => setUserData({ ...userData, name: e.target.value })}
          />
          <Input
            label="密码"
            type="password"
            value={userData.password || ''}
            onChange={e => setUserData({ ...userData, password: e.target.value })}
            placeholder="请输入新密码"
          />
          <div className="pt-2">
            <Button onClick={handleUpdateUser} isLoading={requestLoading}>提交修改</Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h2 className="mb-6 text-lg font-medium text-gray-900 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700">修改网站信息</h2>
        <div className="space-y-5 max-w-2xl">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              网站 logo
            </label>
            <div className="space-y-2">
              <Select
                value={logoMode}
                options={[
                  { label: "手动输入 URL", value: "url" },
                  { label: "上传图片", value: "upload" },
                ]}
                onChange={handleLogoModeChange("logoMode", "favicon", "tempUrl")}
              />

              {logoMode === "url" && (
                <Input
                  value={tempUrl}
                  onChange={e => handleManualUrlChange("favicon")(e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              )}

              {logoMode === "upload" && (
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <span>选择文件</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload("favicon")}
                    />
                  </label>
                  <span className="text-xs text-gray-500">最大 100KB</span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">预览:</span>
                {settingData.favicon ? (
                  <div className="h-8 w-8 rounded border bg-white overflow-hidden">
                    <ToolLogo
                      logo={settingData.favicon}
                      name={settingData.title || "网站"}
                      className="h-full w-full"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">暂无</span>
                )}
              </div>
            </div>
          </div>
          <Input
            label="网站标题"
            value={settingData.title || ''}
            onChange={e => setSettingData({ ...settingData, title: e.target.value })}
          />
          <Input
            label="公信部备案"
            value={settingData.govRecord || ''}
            onChange={e => setSettingData({ ...settingData, govRecord: e.target.value })}
            placeholder="请输入网站备案信息"
          />

          <div>
            <Select
              label="默认跳转方式"
              value={settingData.jumpTargetBlank}
              options={[
                { label: "新标签页", value: true as any },
                { label: "原地跳转", value: false as any }
              ]}
              onChange={val => setSettingData({ ...settingData, jumpTargetBlank: val })}
            />
            <p className="mt-1 text-sm text-gray-500">选择点击卡片后默认的跳转方式</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              logo 192x192
            </label>
            <div className="space-y-2">
              <Select
                value={logo192Mode}
                options={[
                  { label: "手动输入 URL", value: "url" },
                  { label: "上传图片", value: "upload" },
                ]}
                onChange={handleLogoModeChange("logo192Mode", "logo192", "tempLogo192Url")}
              />

              {logo192Mode === "url" && (
                <Input
                  value={tempLogo192Url}
                  onChange={e => handleManualUrlChange("logo192")(e.target.value)}
                  placeholder="https://example.com/logo192.png"
                />
              )}

              {logo192Mode === "upload" && (
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <span>选择文件</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload("logo192")}
                    />
                  </label>
                  <span className="text-xs text-gray-500">最大 100KB</span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">预览:</span>
                {settingData.logo192 ? (
                  <div className="h-8 w-8 rounded border bg-white overflow-hidden">
                    <ToolLogo
                      logo={settingData.logo192}
                      name={settingData.title || "网站"}
                      className="h-full w-full"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">暂无</span>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              logo 512x512
            </label>
            <div className="space-y-2">
              <Select
                value={logo512Mode}
                options={[
                  { label: "手动输入 URL", value: "url" },
                  { label: "上传图片", value: "upload" },
                ]}
                onChange={handleLogoModeChange("logo512Mode", "logo512", "tempLogo512Url")}
              />

              {logo512Mode === "url" && (
                <Input
                  value={tempLogo512Url}
                  onChange={e => handleManualUrlChange("logo512")(e.target.value)}
                  placeholder="https://example.com/logo512.png"
                />
              )}

              {logo512Mode === "upload" && (
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <span>选择文件</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload("logo512")}
                    />
                  </label>
                  <span className="text-xs text-gray-500">最大 100KB</span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">预览:</span>
                {settingData.logo512 ? (
                  <div className="h-8 w-8 rounded border bg-white overflow-hidden">
                    <ToolLogo
                      logo={settingData.logo512}
                      name={settingData.title || "网站"}
                      className="h-full w-full"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">暂无</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">隐藏管理员后台卡片</span>
              <p className="text-xs text-gray-500">开启后将在前台隐藏管理员入口卡片</p>
            </div>
            <Switch checked={!!settingData.hideAdmin} onChange={val => setSettingData({ ...settingData, hideAdmin: val })} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">隐藏 Github 按钮</span>
              <p className="text-xs text-gray-500">开启后将在前台隐藏 Github 悬浮按钮</p>
            </div>
            <Switch checked={!!settingData.hideGithub} onChange={val => setSettingData({ ...settingData, hideGithub: val })} />
          </div>

          <Input
            label="访客密码"
            value={settingData.guestPassword || ''}
            onChange={e => setSettingData({ ...settingData, guestPassword: e.target.value })}
            placeholder="设置后，访问首页需输入密码（留空则不限制）"
            type="password"
          />
          <p className="text-xs text-gray-500 -mt-3">若设置为 "********" 表示密码未变动</p>
        </div>

        <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              自定义 CSS
            </label>
            <textarea
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
              value={settingData.customCSS || ''}
              onChange={e => setSettingData({ ...settingData, customCSS: e.target.value })}
              placeholder="/* 输入自定义 CSS 样式 */"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              自定义 JavaScript
            </label>
            <textarea
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
              value={settingData.customJS || ''}
              onChange={e => setSettingData({ ...settingData, customJS: e.target.value })}
              placeholder="// 输入自定义 JavaScript 代码 (如统计脚本)"
            />
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={handleUpdateWebSite} isLoading={requestLoading}>提交修改</Button>
        </div>
      </div>
    </div>
  );
};
