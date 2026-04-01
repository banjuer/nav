
import { useCallback, useState } from "react";
import { clsx } from "clsx";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { isLogin } from "../../utils/check";
import { fetchUpdateCatelogsSort } from "../../utils/api";

interface CatelogData {
  id: number;
  name: string;
  sort: number;
  hide: boolean;
}

interface TagSelectorProps {
  tags: any;
  onTagChange: (newTag: string) => void;
  currTag: string;
  catelogsData?: CatelogData[];
  onRefresh?: () => void;
}

interface SortableTagProps {
  tag: string;
  isActive: boolean;
  onTagChange: (tag: string) => void;
  canDrag: boolean;
}

const SortableTag = ({ tag, isActive, onTagChange, canDrag }: SortableTagProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...(canDrag ? { ...attributes, ...listeners } : {})}
      onClick={() => onTagChange(tag)}
      className={clsx(
        "rounded-md px-3 py-1 text-sm transition-all md:px-4 md:py-1.5",
        canDrag && "cursor-grab active:cursor-grabbing",
        isActive
          ? "bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
      )}
    >
      {tag}
    </button>
  );
};

const TagSelector = (props: TagSelectorProps) => {
  const { tags = ["all"], onTagChange, currTag, catelogsData = [], onRefresh } = props;
  const [localTags, setLocalTags] = useState<string[]>([]);
  const loggedIn = isLogin();

  const displayTags = localTags.length > 0 ? localTags : tags;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id && over) {
      const oldIndex = displayTags.findIndex((i) => i === active.id);
      const newIndex = displayTags.findIndex((i) => i === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newTags = arrayMove(displayTags, oldIndex, newIndex) as string[];
        setLocalTags(newTags);

        if (catelogsData.length > 0 && loggedIn) {
          const updates = newTags
            .map((tagName, index) => {
              if (tagName === "全部工具" || tagName === "管理后台") return null;
              const catelog = catelogsData.find((c: any) => c.name === tagName);
              if (catelog) {
                return { id: catelog.id, sort: index };
              }
              return null;
            })
            .filter(Boolean) as { id: number; sort: number }[];

          if (updates.length > 0) {
            try {
              await fetchUpdateCatelogsSort(updates);
              if (onRefresh) {
                onRefresh();
              }
            } catch (e) {
              console.error("更新分类排序失败:", e);
            }
          }
        }
      }
    }
  };

  const renderTags = useCallback(() => {
    return displayTags.map((each: string) => {
      const isActive = currTag === each;
      return (
        <SortableTag
          key={`${each}-select-tag`}
          tag={each}
          isActive={isActive}
          onTagChange={onTagChange}
          canDrag={loggedIn}
        />
      );
    });
  }, [displayTags, onTagChange, currTag, loggedIn]);

  if (!loggedIn) {
    return (
      <div className="w-full mb-4 md:mb-6">
        <div className="flex flex-wrap gap-2 md:gap-3">
          {tags.map((each: string) => {
            const isActive = currTag === each;
            return (
              <button
                key={`${each}-select-tag`}
                onClick={() => onTagChange(each)}
                className={clsx(
                  "rounded-md px-3 py-1 text-sm transition-all md:px-4 md:py-1.5",
                  isActive
                    ? "bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                )}
              >
                {each}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-4 md:mb-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={displayTags} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {renderTags()}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default TagSelector;
