import { useMemo, useState, useCallback } from "react";
import clsx from "clsx";
import { getJumpTarget } from "../../utils/setting";
import { ToolLogo } from "../ToolLogo";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { ComboBox } from "../ui/ComboBox";
import { ContextMenu, contextMenuIcons } from "../ui/ContextMenu";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ToolModal, ToolFormData } from "../ToolModal";
import { isLogin } from "../../utils/check";
import { fetchUpdateTool, fetchDeleteTool } from "../../utils/api";
import { useToast } from "../ui/Toast";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CardProps {
  id: number;
  title: string;
  url: string;
  des: string;
  logo: string;
  catelog: string;
  onClick: () => void;
  index: number;
  isSearching: boolean;
  catelogs?: string[];
  onRefresh?: () => void;
  draggable?: boolean;
}

// 变量定义接口
interface VariableDef {
  name: string;           // 变量名
  presetValues: string[]; // 预定义值列表
  hasPreset: boolean;     // 是否有预定义值
}

const Card = ({ id, title, url, des, logo, catelog, onClick, index, isSearching, catelogs = [], onRefresh, draggable = false }: CardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [variableDefs, setVariableDefs] = useState<VariableDef[]>([]);
  const [processedUrl, setProcessedUrl] = useState(url);
  
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<ToolFormData>({
    name: "",
    url: "",
    logo: "",
    catelog: "",
    desc: "",
    sort: 0,
    hide: false,
  });
  const [loading, setLoading] = useState(false);
  
  const { success, error } = useToast();
  const loggedIn = isLogin();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  const showNumIndex = index < 10 && isSearching;

  // 提取变量定义，支持格式：{var} 或 {var=value} 或 {var=value1,value2}
  const extractVariableDefs = (url: string): { defs: VariableDef[]; cleanUrl: string } => {
    const regex = /\{([^}]+)\}/g;
    const defs: VariableDef[] = [];
    let cleanUrl = url;
    let match;
    
    while ((match = regex.exec(url)) !== null) {
      const content = match[1];
      const equalIndex = content.indexOf('=');
      
      let varDef: VariableDef;
      if (equalIndex > 0) {
        // 有预定义值: {var=value1,value2}
        const name = content.substring(0, equalIndex);
        const valuesStr = content.substring(equalIndex + 1);
        const presetValues = valuesStr.split(',').filter(v => v.trim() !== '');
        varDef = {
          name,
          presetValues,
          hasPreset: presetValues.length > 0
        };
        // 替换 URL 中的变量为纯变量格式，用于后续替换
        cleanUrl = cleanUrl.replace(match[0], `{${name}}`);
      } else {
        // 无预定义值: {var}
        varDef = {
          name: content,
          presetValues: [],
          hasPreset: false
        };
      }
      
      // 避免重复添加同名变量
      if (!defs.find(d => d.name === varDef.name)) {
        defs.push(varDef);
      }
    }
    
    return { defs, cleanUrl };
  };

  // 更新 URL 中的预定义值（用于保存用户输入的新值）
  const updateUrlWithNewPresetValue = (originalUrl: string, varName: string, newValue: string): string => {
    const regex = new RegExp(`\\{${varName}([^}]*)\\}`);
    return originalUrl.replace(regex, (match) => {
      const equalIndex = match.indexOf('=');
      if (equalIndex > 0) {
        // 有预定义值，检查是否需要追加
        const valuesStr = match.substring(equalIndex + 1, match.length - 1);
        const existingValues = valuesStr.split(',').map((v: string) => v.trim()).filter((v: string) => v !== '');
        
        // 去重检查
        if (!existingValues.includes(newValue)) {
          return `{${varName}=${valuesStr},${newValue}}`;
        }
        return match;
      }
      // 没有预定义值，不修改
      return match;
    });
  };

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (url === "toggleJumpTarget") {
      onClick();
      e.preventDefault();
      return;
    }

    const { defs, cleanUrl } = extractVariableDefs(url);
    if (defs.length > 0) {
      e.preventDefault();
      setVariableDefs(defs);
      setProcessedUrl(cleanUrl);
      
      // 设置默认值：有预置值时，第一个值为默认值
      const defaultValues: Record<string, string> = {};
      defs.forEach(def => {
        if (def.hasPreset && def.presetValues.length > 0) {
          defaultValues[def.name] = def.presetValues[0];
        }
      });
      setVariables(defaultValues);
      
      setIsModalOpen(true);
    } else {
      onClick();
    }
  };

  const handleVariableChange = (variable: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const handleSubmit = async () => {
    const allFilled = variableDefs.every(def => variables[def.name] !== undefined && variables[def.name] !== "");
    if (!allFilled) return;

    let finalUrl = processedUrl;
    let updatedOriginalUrl = url;
    let hasNewValue = false;
    
    variableDefs.forEach(def => {
      const value = variables[def.name];
      finalUrl = finalUrl.replace(new RegExp(`\\{${def.name}\\}`, "g"), value);
      
      // 如果有预定义值且用户输入的值不在预定义列表中，追加到 URL
      if (def.hasPreset && !def.presetValues.includes(value)) {
        updatedOriginalUrl = updateUrlWithNewPresetValue(updatedOriginalUrl, def.name, value);
        hasNewValue = true;
      }
    });

    // 关闭弹窗
    setIsModalOpen(false);
    
    // 打开链接
    window.open(finalUrl, getJumpTarget() === "blank" ? "_blank" : "_self");

    // 如果有新值需要保存，异步保存（不阻塞用户体验）
    if (hasNewValue && loggedIn && onRefresh) {
      try {
        await fetchUpdateTool({
          id,
          name: title,
          url: updatedOriginalUrl,
          logo,
          catelog,
          desc: des,
          sort: 0,
          hide: false,
        });
        // 静默刷新数据
        onRefresh();
      } catch (e) {
        console.error("更新 URL 失败:", e);
      }
    }
  };

  const handleEnterKey = () => {
    handleSubmit();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!loggedIn) return;
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  const handleVisit = useCallback(() => {
    const { defs, cleanUrl } = extractVariableDefs(url);
    if (defs.length > 0) {
      setVariableDefs(defs);
      setProcessedUrl(cleanUrl);
      
      // 设置默认值
      const defaultValues: Record<string, string> = {};
      defs.forEach(def => {
        if (def.hasPreset && def.presetValues.length > 0) {
          defaultValues[def.name] = def.presetValues[0];
        }
      });
      setVariables(defaultValues);
      
      setIsModalOpen(true);
    } else {
      window.open(url, getJumpTarget() === "blank" ? "_blank" : "_self");
      onClick();
    }
  }, [url, onClick]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      success("链接已复制到剪贴板");
    }).catch(() => {
      error("复制失败");
    });
  }, [url, success, error]);

  const handleEdit = useCallback(() => {
    setEditFormData({
      id,
      name: title,
      url,
      logo,
      catelog,
      desc: des,
      sort: 0,
      hide: false,
    });
    setEditModalOpen(true);
  }, [id, title, url, logo, catelog, des]);

  const handleSaveEdit = async (isEdit: boolean) => {
    if (!editFormData.name || !editFormData.url || !editFormData.catelog) {
      error("请填写必要信息 (名称, 网址, 分类)");
      return;
    }
    
    setLoading(true);
    try {
      await fetchUpdateTool(editFormData);
      success("修改成功");
      setEditModalOpen(false);
      onRefresh?.();
    } catch (e) {
      error("修改失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetchDeleteTool(id);
      success("删除成功");
      onRefresh?.();
    } catch (e) {
      error("删除失败");
    } finally {
      setLoading(false);
    }
  };

  const contextMenuItems = useMemo(() => [
    {
      label: "访问",
      icon: contextMenuIcons.visit,
      onClick: handleVisit,
    },
    {
      label: "复制链接",
      icon: contextMenuIcons.copy,
      onClick: handleCopy,
    },
    {
      label: "编辑",
      icon: contextMenuIcons.edit,
      onClick: handleEdit,
    },
    {
      label: "删除",
      icon: contextMenuIcons.delete,
      onClick: () => setDeleteConfirmOpen(true),
      danger: true,
    },
  ], [handleVisit, handleCopy, handleEdit]);

  const categoryOptions = catelogs.map(c => ({ label: c, value: c }));

  return (
    <>
      <div
        ref={setNodeRef}
        style={sortableStyle}
        {...(draggable ? { ...attributes, ...listeners } : {})}
        className={clsx(
          draggable && "cursor-grab active:cursor-grabbing"
        )}
      >
        <a
          href={url === "toggleJumpTarget" ? undefined : url}
          onClick={handleCardClick}
          onContextMenu={handleContextMenu}
          target={getJumpTarget() === "blank" ? "_blank" : "_self"}
          rel="noreferrer"
          className={clsx("van-card", styles.container)}
        >
          {showNumIndex && (
            <span className={clsx("van-card-index", styles.index)}>
              {index + 1}
            </span>
          )}

          <div className={clsx("van-card-icon", styles.iconWrapper)}>
            <ToolLogo logo={logo} name={title} url={url} className="h-full w-full text-xl" />
          </div>

          <div className={clsx("van-card-content", styles.content)}>
            <div className={clsx("van-card-header", styles.header)}>
              <h3 className={clsx("van-card-title", styles.title)} title={title}>
                {title}
              </h3>
              {catelog && (
                <span className={clsx("van-card-catelog", styles.catelog)}>
                  {catelog}
                </span>
              )}
            </div>
            <p className={clsx("van-card-desc", styles.desc)} title={des}>
              {des}
            </p>
          </div>
        </a>
      </div>

      {/* 变量输入弹窗 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`填写 ${title} 的变量`}
        footer={
          <>
            <Button onClick={() => setIsModalOpen(false)} variant="secondary">
              取消
            </Button>
            <Button onClick={handleSubmit}>
              确认
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {variableDefs.map((def) => (
            <div key={def.name} className="flex items-center gap-3">
              <label className="w-20 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300 text-right">
                {def.name}
              </label>
              <div className="flex-1">
                {def.hasPreset ? (
                  <ComboBox
                    value={variables[def.name] || ""}
                    onChange={(value) => handleVariableChange(def.name, value)}
                    options={def.presetValues.map(v => ({ label: v, value: v }))}
                    placeholder={`请选择或输入 ${def.name}`}
                    onEnter={handleEnterKey}
                  />
                ) : (
                  <Input
                    type="text"
                    value={variables[def.name] || ""}
                    onChange={(e) => handleVariableChange(def.name, e.target.value)}
                    placeholder={`请输入 ${def.name}`}
                    className="w-full"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleEnterKey();
                      }
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {loggedIn && (
        <ContextMenu
          isOpen={contextMenuOpen}
          onClose={() => setContextMenuOpen(false)}
          position={contextMenuPosition}
          items={contextMenuItems}
        />
      )}

      <ToolModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="编辑书签"
        isEdit={true}
        loading={loading}
        formData={editFormData}
        setFormData={setEditFormData}
        onSubmit={handleSaveEdit}
        categoryOptions={categoryOptions}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="确认删除"
        description={`确定要删除「${title}」吗？此操作无法撤销。`}
        confirmText="删除"
        cancelText="取消"
        isDestructive
      />
    </>
  );
};

const styles = {
  container: "group relative flex w-full cursor-pointer flex-col items-center p-4 rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800 sm:flex-row sm:items-center sm:text-left",
  index: "absolute right-2 top-2 font-mono text-xs text-gray-300 dark:text-gray-600",
  iconWrapper: "mb-2 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700 overflow-hidden sm:mb-0 sm:mr-4 sm:h-12 sm:w-12",
  content: "flex flex-col items-center min-w-0 flex-1 w-full sm:items-start justify-center",
  header: "flex flex-col items-center gap-1 w-full sm:flex-row sm:justify-between sm:w-full",
  title: "truncate text-sm text-gray-900 dark:text-gray-100 w-full text-center sm:w-auto sm:text-left sm:flex-1",
  catelog: "hidden sm:block shrink-0 rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-700 dark:text-gray-400",
  desc: "hidden sm:block mt-1 w-full text-xs text-gray-500 dark:text-gray-400 truncate",
};

export default Card;
