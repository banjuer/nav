import { useState, useEffect, useMemo } from "react";
import { clsx } from "clsx";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Switch } from "../ui/Switch";
import { fetchAddTool } from "../../utils/api";
import { useToast } from "../ui/Toast";

interface AddToolButtonProps {
  catelogs: string[];
  onSuccess: () => void;
  showGithub: boolean;
}

const FormItem = ({ label, children, className = "" }: { label: string, children: React.ReactNode, className?: string }) => (
  <div className={`md:col-span-2 flex items-center gap-4 ${className}`}>
    <label className="w-12 flex-shrink-0 text-right text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <div className="flex-1 min-w-0">
      {children}
    </div>
  </div>
);

const AddToolButton = ({ catelogs, onSuccess, showGithub }: AddToolButtonProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  
  const [formData, setFormData] = useState({
    sort: 1,
    hide: false,
    name: "",
    url: "",
    logo: "",
    catelog: "",
    desc: ""
  });

  const [logoMode, setLogoMode] = useState<"google" | "url" | "upload">("google");
  const [tempUrl, setTempUrl] = useState("");

  // 检查登录状态
  useEffect(() => {
    const token = window.localStorage.getItem("_token");
    setIsLoggedIn(!!token);
  }, []);

  // 监听 localStorage 变化（用于登录/登出后更新状态）
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

  // 计算底部位置
  // 从下到上: GithubLink -> DarkSwitch -> LoginButton -> AddToolButton(最上)
  // 各按钮高度约 40px，间距 16px
  // 当前按钮在最上方（离底部最远）
  const bottomPosition = useMemo(() => {
    if (showGithub) {
      // GithubLink(bottom-3=12px) + 间距(16px) + DarkSwitch(40px) + 间距(16px) + LoginButton(40px) + 间距(16px) = 152px
      return "bottom-[152px] md:bottom-[168px]";
    }
    // DarkSwitch(bottom-[56px]=56px) + 间距(16px) + LoginButton(40px) + 间距(16px) = 152px
    return "bottom-[104px] md:bottom-[120px]";
  }, [showGithub]);

  const categoryOptions = useMemo(() => {
    return catelogs
      .filter(c => c !== "全部工具" && c !== "管理后台")
      .map(c => ({ label: c, value: c }));
  }, [catelogs]);

  const resetForm = () => {
    setFormData({
      sort: 1,
      hide: false,
      name: "",
      url: "",
      logo: "",
      catelog: "",
      desc: ""
    });
    setLogoMode("google");
    setTempUrl("");
  };

  const handleOpen = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    // 基本验证
    if (!formData.name || !formData.url || !formData.catelog) {
      error("请填写必要信息 (名称, 网址, 分类)");
      return;
    }

    setLoading(true);
    try {
      await fetchAddTool(formData);
      success("添加成功");
      setIsOpen(false);
      onSuccess();
    } catch (e) {
      error("添加失败");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024) { // 100KB limit
      error("文件大小不能超过 100KB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (result) => {
      setFormData({ ...formData, logo: result.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleManualUrlChange = (val: string) => {
    setTempUrl(val);
    setFormData({ ...formData, logo: val });
  };

  const handleModeChange = (val: any) => {
    setLogoMode(val);
    if (val === 'url') {
      setFormData((prev) => ({ ...prev, logo: tempUrl }));
    } else if (val === 'google') {
      if (formData.url) {
        const googleUrl = `https://t3.gstatic.cn/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(formData.url)}&size=64`;
        setFormData((prev) => ({ ...prev, logo: googleUrl }));
      }
    } else if (val === 'upload') {
      setFormData((prev) => ({ ...prev, logo: "" }));
    }
  };

  // 未登录不显示按钮
  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      {/* 浮动按钮 */}
      <div
        className={clsx(
          "fixed right-3 z-[60] flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur transition-all hover:bg-white hover:shadow-md dark:bg-gray-800/80 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200",
          bottomPosition
        )}
        onClick={handleOpen}
        title="新增书签"
      >
        <PlusIcon className="h-5 w-5" />
      </div>

      {/* 新增弹窗 */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="新增书签"
        panelClassName="max-w-xl"
        footer={
          <>
            <Button variant="secondary" onClick={handleClose} disabled={loading}>取消</Button>
            <Button onClick={handleSubmit} isLoading={loading}>确定</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormItem label="名称">
            <Input
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="工具名称"
            />
          </FormItem>
          <FormItem label="网址">
            <Input
              value={formData.url}
              onChange={e => {
                const newUrl = e.target.value;
                let newLogo = formData.logo;
                if (logoMode === "google") {
                  newLogo = `https://t3.gstatic.cn/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(newUrl)}&size=64`;
                }
                setFormData({ ...formData, url: newUrl, logo: newLogo });
              }}
              placeholder="https://"
            />
          </FormItem>
          <FormItem label="Logo">
            <div className="flex flex-col gap-2 w-full">
              <Select
                value={logoMode}
                options={[
                  { label: "Google Favicon", value: "google" },
                  { label: "手动输入 URL", value: "url" },
                  { label: "上传图片", value: "upload" },
                ]}
                onChange={handleModeChange}
              />

              {logoMode === "url" && (
                <Input
                  value={tempUrl}
                  onChange={e => handleManualUrlChange(e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              )}

              {logoMode === "upload" && (
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <span>选择文件</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                  <span className="text-xs text-gray-500">最大 100KB</span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">预览:</span>
                {formData.logo ? (
                  <img
                    src={(formData.logo && (formData.logo.startsWith("data:") || formData.logo.startsWith("http"))) ? formData.logo : (formData.logo ? `/api/img?url=${encodeURIComponent(formData.logo)}` : "")
                    alt="Preview"
                    className="h-8 w-8 rounded object-contain border bg-white"
                    onError={(e) => { }}
                  />
                ) : (
                  <span className="text-xs text-gray-400">暂无</span>
                )}
              </div>
            </div>
          </FormItem>
          <FormItem label="分类">
            <Select
              value={formData.catelog}
              options={categoryOptions}
              onChange={val => setFormData({ ...formData, catelog: val })}
              placeholder="选择分类"
            />
          </FormItem>
          <FormItem label="描述" className="items-start">
            <Input
              textarea
              rows={3}
              value={formData.desc}
              onChange={e => setFormData({ ...formData, desc: e.target.value })}
              placeholder="工具描述（可选）"
            />
          </FormItem>
          <FormItem label="排序">
            <Input
              type="number"
              value={formData.sort}
              onChange={e => setFormData({ ...formData, sort: parseInt(e.target.value) || 1 })}
            />
          </FormItem>
          <FormItem label="隐藏">
            <Switch checked={!!formData.hide} onChange={val => setFormData({ ...formData, hide: val })} />
          </FormItem>
        </div>
      </Modal>
    </>
  );
};

export default AddToolButton;
