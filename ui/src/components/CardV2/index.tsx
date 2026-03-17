import { useMemo, useState, useCallback } from "react";
import clsx from "clsx";
import { getJumpTarget } from "../../utils/setting";
import { ToolLogo } from "../ToolLogo";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { ContextMenu, contextMenuIcons } from "../ui/ContextMenu";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { isLogin } from "../../utils/check";
import { fetchUpdateTool, fetchDeleteTool } from "../../utils/api";
import { useToast } from "../ui/Toast";

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
}

const Card = ({ id, title, url, des, logo, catelog, onClick, index, isSearching, catelogs = [], onRefresh }: CardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [variableFields, setVariableFields] = useState<string[]>([]);
  
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  
  const { success, error } = useToast();
  const loggedIn = isLogin();

  const showNumIndex = index < 10 && isSearching;

  const extractVariables = (url: string): string[] => {
    const regex = /\{([^}]+)\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(url)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  };

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (url === "toggleJumpTarget") {
      onClick();
      e.preventDefault();
      return;
    }

    const variables = extractVariables(url);
    if (variables.length > 0) {
      e.preventDefault();
      setVariableFields(variables);
      setVariables({});
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

  const handleSubmit = () => {
    const allFilled = variableFields.every(field => variables[field] !== undefined && variables[field] !== "");
    if (!allFilled) return;

    let finalUrl = url;
    variableFields.forEach(field => {
      finalUrl = finalUrl.replace(new RegExp(`\\{${field}\\}`, "g"), variables[field]);
    });

    window.open(finalUrl, getJumpTarget() === "blank" ? "_blank" : "_self");
    setIsModalOpen(false);
    onClick();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!loggedIn) return;
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  const handleVisit = useCallback(() => {
    const vars = extractVariables(url);
    if (vars.length > 0) {
      setVariableFields(vars);
      setVariables({});
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

  const handleSaveEdit = async () => {
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
        <div className="space-y-4">
          {variableFields.map((variable) => (
            <div key={variable}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {variable}
              </label>
              <Input
                type="text"
                value={variables[variable] || ""}
                onChange={(e) => handleVariableChange(variable, e.target.value)}
                placeholder={`请输入 ${variable}`}
                className="w-full"
              />
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

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="编辑书签"
        panelClassName="max-w-xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditModalOpen(false)} disabled={loading}>
              取消
            </Button>
            <Button onClick={handleSaveEdit} isLoading={loading}>
              确认
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex items-center gap-4">
            <label className="w-12 flex-shrink-0 text-right text-sm font-medium text-gray-700 dark:text-gray-300">ID</label>
            <div className="flex-1 min-w-0">
              <Input value={editFormData.id} disabled className="bg-gray-100" />
            </div>
          </div>
          <div className="md:col-span-2 flex items-center gap-4">
            <label className="w-12 flex-shrink-0 text-right text-sm font-medium text-gray-700 dark:text-gray-300">名称</label>
            <div className="flex-1 min-w-0">
              <Input
                value={editFormData.name}
                onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="工具名称"
              />
            </div>
          </div>
          <div className="md:col-span-2 flex items-center gap-4">
            <label className="w-12 flex-shrink-0 text-right text-sm font-medium text-gray-700 dark:text-gray-300">网址</label>
            <div className="flex-1 min-w-0">
              <Input
                value={editFormData.url}
                onChange={e => setEditFormData({ ...editFormData, url: e.target.value })}
                placeholder="https://"
              />
            </div>
          </div>
          <div className="md:col-span-2 flex items-center gap-4">
            <label className="w-12 flex-shrink-0 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Logo</label>
            <div className="flex-1 min-w-0">
              <Input
                value={editFormData.logo}
                onChange={e => setEditFormData({ ...editFormData, logo: e.target.value })}
                placeholder="Logo URL"
              />
            </div>
          </div>
          <div className="md:col-span-2 flex items-center gap-4">
            <label className="w-12 flex-shrink-0 text-right text-sm font-medium text-gray-700 dark:text-gray-300">分类</label>
            <div className="flex-1 min-w-0">
              <Select
                value={editFormData.catelog}
                options={categoryOptions}
                onChange={val => setEditFormData({ ...editFormData, catelog: val })}
                placeholder="选择分类"
              />
            </div>
          </div>
          <div className="md:col-span-2 flex items-start gap-4">
            <label className="w-12 flex-shrink-0 text-right text-sm font-medium text-gray-700 dark:text-gray-300 pt-2">描述</label>
            <div className="flex-1 min-w-0">
              <Input
                textarea
                rows={3}
                value={editFormData.desc}
                onChange={e => setEditFormData({ ...editFormData, desc: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>

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
  container: "group relative flex w-full cursor-pointer flex-col items-center p-4 rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800 sm:flex-row sm:items-center sm:text-left",
  index: "absolute right-2 top-2 font-mono text-xs text-gray-300 dark:text-gray-600",
  iconWrapper: "mb-2 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700 overflow-hidden sm:mb-0 sm:mr-4 sm:h-12 sm:w-12",
  content: "flex flex-col items-center min-w-0 flex-1 w-full sm:items-start",
  header: "flex flex-col items-center gap-1 w-full sm:flex-row sm:justify-between sm:w-full",
  title: "truncate text-sm text-gray-900 dark:text-gray-100 w-full text-center sm:w-auto sm:text-left sm:flex-1",
  catelog: "hidden sm:block shrink-0 rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-700 dark:text-gray-400",
  desc: "hidden sm:line-clamp-3 mt-1 text-xs text-gray-500 dark:text-gray-400 break-all",
};

export default Card;
