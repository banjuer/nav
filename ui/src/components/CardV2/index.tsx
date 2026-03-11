import { useMemo, useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { getJumpTarget } from "../../utils/setting";
import { ToolLogo } from "../ToolLogo";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface CardProps {
  title: string;
  url: string;
  des: string;
  logo: string;
  catelog: string;
  onClick: () => void;
  index: number;
  isSearching: boolean;
}

const Card = ({ title, url, des, logo, catelog, onClick, index, isSearching }: CardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [variableFields, setVariableFields] = useState<string[]>([]);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const showNumIndex = index < 10 && isSearching;

  // 检测URL中的变量，格式为 {variable}
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
    // 检查所有变量是否都已填写
    const allFilled = variableFields.every(field => variables[field] !== undefined && variables[field] !== "");
    if (!allFilled) return;

    // 替换URL中的变量
    let finalUrl = url;
    variableFields.forEach(field => {
      finalUrl = finalUrl.replace(new RegExp(`\\{${field}\\}`, "g"), variables[field]);
    });

    // 打开新链接
    window.open(finalUrl, getJumpTarget() === "blank" ? "_blank" : "_self");
    setIsModalOpen(false);
    onClick();
  };

  // 当弹窗打开时，聚焦到第一个输入框
  useEffect(() => {
    if (isModalOpen) {
      // 使用setTimeout确保DOM已经渲染完成
      const timer = setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen, variableFields]);

  // 处理键盘事件，支持Enter键跳转
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <>
      <a
        href={url === "toggleJumpTarget" ? undefined : url}
        onClick={handleCardClick}
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
        <div className="space-y-4" onKeyDown={handleKeyDown}>
          {variableFields.map((variable, index) => (
            <div key={variable} className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
                {variable}:
              </label>
              <Input
                type="text"
                value={variables[variable] || ""}
                onChange={(e) => handleVariableChange(variable, e.target.value)}
                placeholder={`请输入 ${variable}`}
                className="flex-1"
                ref={index === 0 ? firstInputRef : undefined}
              />
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

const styles = {
  container: "group relative flex w-full cursor-pointer flex-col items-center p-4 rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800 sm:flex-row sm:items-center sm:text-left",
  index: "absolute right-2 top-2 font-mono text-xs text-gray-300 dark:text-gray-600",
  iconWrapper: "mb-2 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700 overflow-hidden sm:mb-0 sm:mr-4 sm:h-12 sm:w-12",
  // iconPlaceholder: removed
  // iconImg: removed
  content: "flex flex-col items-center min-w-0 flex-1 w-full sm:items-start",
  header: "flex flex-col items-center gap-1 w-full sm:flex-row sm:justify-between sm:w-full",
  title: "truncate text-sm text-gray-900 dark:text-gray-100 w-full text-center sm:w-auto sm:text-left sm:flex-1",
  catelog: "hidden sm:block shrink-0 rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-700 dark:text-gray-400",
  desc: "hidden sm:line-clamp-3 mt-1 text-xs text-gray-500 dark:text-gray-400 break-all",
};

export default Card;
