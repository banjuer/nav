import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Switch } from "../ui/Switch";
import { useToast } from "../ui/Toast";
import { ToolLogo } from "../ToolLogo";

interface ToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isEdit: boolean;
  loading: boolean;
  formData: ToolFormData;
  setFormData: React.Dispatch<React.SetStateAction<ToolFormData>>;
  onSubmit: (isEdit: boolean) => void;
  categoryOptions: { label: string; value: string }[];
}

export interface ToolFormData {
  id?: number;
  name: string;
  url: string;
  logo: string;
  catelog: string;
  desc: string;
  sort: number;
  hide: boolean;
}

const FormItem = ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`md:col-span-2 flex items-center gap-4 ${className}`}>
    <label className="w-12 flex-shrink-0 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

export const ToolModal = ({
  isOpen,
  onClose,
  title,
  isEdit,
  loading,
  formData,
  setFormData,
  onSubmit,
  categoryOptions,
}: ToolModalProps) => {
  const { error } = useToast();
  const [logoMode, setLogoMode] = useState<"google" | "url" | "upload">(
    "google"
  );
  const [tempUrl, setTempUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (!formData.logo) {
        setLogoMode("google");
        setTempUrl("");
      } else if (formData.logo.startsWith("data:")) {
        setLogoMode("upload");
        setTempUrl("");
      } else if (
        formData.logo.startsWith("https://t3.gstatic.cn/faviconV2")
      ) {
        setLogoMode("google");
        setTempUrl("");
      } else {
        setLogoMode("url");
        setTempUrl(formData.logo);
      }
    }
  }, [isOpen, formData.logo]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
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
    if (val === "url") {
      setFormData((prev) => ({ ...prev, logo: tempUrl }));
    } else if (val === "google") {
      if (formData.url) {
        const googleUrl = `https://t3.gstatic.cn/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
          formData.url
        )}&size=64`;
        setFormData((prev) => ({ ...prev, logo: googleUrl }));
      }
    } else if (val === "upload") {
      // 保持当前logo值，不要重置为""，避免触发useEffect重新计算logoMode
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      panelClassName="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={() => onSubmit(isEdit)} isLoading={loading}>
            确定
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isEdit && (
          <FormItem label="ID">
            <Input value={formData.id} disabled className="bg-gray-100" />
          </FormItem>
        )}
        <FormItem label="名称">
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="工具名称"
          />
        </FormItem>
        <FormItem label="网址">
          <Input
            value={formData.url}
            onChange={(e) => {
              const newUrl = e.target.value;
              let newLogo = formData.logo;
              if (logoMode === "google") {
                newLogo = `https://t3.gstatic.cn/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
                  newUrl
                )}&size=64`;
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
                onChange={(e) => handleManualUrlChange(e.target.value)}
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
                    onChange={handleFileUpload}
                  />
                </label>
                <span className="text-xs text-gray-500">最大 100KB</span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">预览:</span>
              {formData.logo ? (
                <div className="h-8 w-8 rounded border bg-white overflow-hidden">
                  <ToolLogo
                    logo={formData.logo}
                    name={formData.name}
                    className="h-full w-full"
                  />
                </div>
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
            onChange={(val) => setFormData({ ...formData, catelog: val })}
            placeholder="选择分类"
          />
        </FormItem>
        <FormItem label="描述" className="items-start">
          <Input
            textarea
            rows={3}
            value={formData.desc}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
          />
        </FormItem>
        <FormItem label="排序">
          <Input
            type="number"
            value={formData.sort}
            onChange={(e) =>
              setFormData({ ...formData, sort: parseInt(e.target.value) })
            }
          />
        </FormItem>
        <FormItem label="隐藏">
          <Switch
            checked={!!formData.hide}
            onChange={(val) => setFormData({ ...formData, hide: val })}
          />
        </FormItem>
      </div>
    </Modal>
  );
};
