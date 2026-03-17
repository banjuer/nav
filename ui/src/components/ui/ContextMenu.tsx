import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { ArrowTopRightOnSquareIcon, ClipboardDocumentIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  items: ContextMenuItem[];
}

export function ContextMenu({ isOpen, onClose, position, items }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const padding = 8;

      let x = position.x;
      let y = position.y;

      if (x + rect.width + padding > window.innerWidth) {
        x = window.innerWidth - rect.width - padding;
      }

      if (y + rect.height + padding > window.innerHeight) {
        y = window.innerHeight - rect.height - padding;
      }

      x = Math.max(padding, x);
      y = Math.max(padding, y);

      setAdjustedPosition({ x, y });
    }
  }, [isOpen, position]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={clsx(
        "van-context-menu",
        "fixed z-[9999] min-w-[160px] rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5",
        "dark:bg-gray-800 dark:ring-white/10",
        "animate-in fade-in zoom-in-95 duration-100"
      )}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className={clsx(
            "van-context-menu-item",
            "flex w-full items-center gap-2 px-3 py-2 text-sm text-left",
            "transition-colors duration-100",
            item.danger
              ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          )}
        >
          {item.icon && <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>}
          <span>{item.label}</span>
        </button>
      ))}
    </div>,
    document.body
  );
}

export const contextMenuIcons = {
  visit: <ArrowTopRightOnSquareIcon className="w-4 h-4" />,
  copy: <ClipboardDocumentIcon className="w-4 h-4" />,
  edit: <PencilSquareIcon className="w-4 h-4" />,
  delete: <TrashIcon className="w-4 h-4" />,
};
