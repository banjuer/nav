
import CardV2 from "../CardV2";
import SearchBar from "../SearchBar";
import { Loading } from "../Loading";
import { Helmet } from "react-helmet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { FetchList, fetchUpdateToolsSort } from "../../utils/api";
import TagSelector from "../TagSelector";
import pinyin from "pinyin-match";
import GithubLink from "../GithubLink";
import DarkSwitch from "../DarkSwitch";
import LoginButton from "../LoginButton";
import AddToolButton from "../AddToolButton";

import { toggleJumpTarget } from "../../utils/setting";
import LockScreen from "../LockScreen";
import { InboxIcon } from "@heroicons/react/24/outline";
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { isLogin } from "../../utils/check";
import { getThemeById } from "../../themes";

const mutiSearch = (s: string, t: string) => {
  const source = (s || "").toLowerCase();
  const target = t.toLowerCase();
  const rawInclude = source.includes(target);
  const pinYinInlcude = Boolean(pinyin.match(source, target));
  return rawInclude || pinYinInlcude;
};

const Content = (props: any) => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [currTag, setCurrTag] = useState("全部工具");
  const [searchString, setSearchString] = useState("");
  const [val, setVal] = useState("");
  const [locked, setLocked] = useState(false);
  const [localFilteredData, setLocalFilteredData] = useState<any[]>([]);

  const filteredDataRef = useRef<any>([]);
  const loggedIn = isLogin();

  // 获取当前主题
  const currentTheme = useMemo(() => {
    const themeId = data?.setting?.theme || 'default';
    return getThemeById(themeId);
  }, [data?.setting?.theme]);

  // 注入主题自定义 CSS
  useEffect(() => {
    const styleId = 'theme-custom-css';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    const themeCSS = currentTheme.customCSS || '';
    const customCSS = data?.setting?.customCSS || '';
    styleEl.innerHTML = themeCSS + '\n' + customCSS;
  }, [currentTheme, data?.setting?.customCSS]);

  // 注入主题自定义 JS
  useEffect(() => {
    const themeJS = currentTheme.customJS || '';
    const customJS = data?.setting?.customJS || '';
    const combinedJS = themeJS + '\n' + customJS;
    
    if (combinedJS.trim()) {
      const scriptId = 'theme-custom-js';
      let scriptEl = document.getElementById(scriptId) as HTMLScriptElement;
      
      if (scriptEl) {
        scriptEl.remove();
      }
      
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.innerHTML = combinedJS;
      document.body.appendChild(scriptEl);
    }
  }, [currentTheme, data?.setting?.customJS]);

  // 根据主题动态生成样式
  const styles = useMemo(() => {
    const isMobileApp = currentTheme.styles.layout === 'mobile-app';
    
    return {
      root: isMobileApp 
        ? "min-h-screen pb-20 dark:bg-gray-900"
        : "min-h-screen bg-gray-50 pb-20 dark:bg-gray-900",
      header: isMobileApp
        ? "sticky top-0 z-50 w-full py-4 backdrop-blur-md transition-colors"
        : "sticky top-0 z-50 w-full bg-gray-50/95 py-4 backdrop-blur-md transition-colors dark:bg-gray-900/95",
      headerContent: currentTheme.styles.container || "container mx-auto px-4 max-w-7xl",
      contentContainer: clsx(
        currentTheme.styles.container || "container mx-auto px-4 max-w-7xl relative z-10",
        isMobileApp ? "" : "pt-4"
      ),
      grid: isMobileApp 
        ? "van-layout-grid grid gap-3"
        : "grid gap-3 sm:gap-4",
      footer: "fixed bottom-2 left-0 right-0 text-center text-xs text-gray-400 dark:text-gray-600 z-40",
    };
  }, [currentTheme]);

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

  const showGithub = useMemo(() => {
    const hide = data?.setting?.hideGithub === true
    return !hide;
  }, [data])

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const r = await FetchList();
      if (r.locked) {
        setLocked(true);
        // Still set data setting for title/favicon if available?
        // Backend returns setting even if locked.
        setData({ setting: r.setting });
      } else {
        setLocked(false);
        setData(r);
        const tagInLocalStorage = window.localStorage.getItem("tag");
        if (tagInLocalStorage && tagInLocalStorage !== "") {
          if (r?.catelogs && r?.catelogs.includes(tagInLocalStorage)) {
            setCurrTag(tagInLocalStorage);
          }
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, [setData, setLoading, setCurrTag]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  // Inject Custom Code
  useEffect(() => {
    if (data?.setting) {
      // CSS
      if (data.setting.customCSS) {
        const style = document.createElement('style');
        style.id = 'custom-css';
        style.innerHTML = data.setting.customCSS;
        document.head.appendChild(style);
        return () => {
          const el = document.getElementById('custom-css');
          if (el) el.remove();
        };
      }
    }
  }, [data?.setting?.customCSS]);

  useEffect(() => {
    if (data?.setting?.customJS) {
      try {
        const rawJS = data.setting.customJS.trim();
        const existingScript = document.getElementById('custom-js');
        if (existingScript) existingScript.remove();

        // Check if input is a script tag
        if (rawJS.startsWith('<script')) {
          const div = document.createElement('div');
          div.innerHTML = rawJS;
          const originalScript = div.querySelector('script');

          if (originalScript) {
            const script = document.createElement('script');
            script.id = 'custom-js';

            // Copy all attributes
            Array.from(originalScript.attributes).forEach(attr => {
              script.setAttribute(attr.name, attr.value);
            });

            // Copy content
            if (originalScript.innerHTML) {
              script.innerHTML = originalScript.innerHTML;
            }

            document.body.appendChild(script);
          }
        } else {
          // Treat as raw JS code
          const script = document.createElement('script');
          script.id = 'custom-js';
          script.innerHTML = rawJS;
          document.body.appendChild(script);
        }

        return () => {
          const el = document.getElementById('custom-js');
          if (el) el.remove();
        };
      } catch (e) {
        console.error("Failed to inject custom JS", e);
      }
    }
  }, [data?.setting?.customJS]);

  const handleSetCurrTag = (tag: string) => {
    setCurrTag(tag);
    if (tag !== "管理后台") {
      window.localStorage.setItem("tag", tag);
    }
    resetSearch(true);
  };

  const resetSearch = (notSetTag?: boolean) => {
    setVal("");
    setSearchString("");
    const tagInLocalStorage = window.localStorage.getItem("tag");
    if (!notSetTag && tagInLocalStorage && tagInLocalStorage !== "" && tagInLocalStorage !== "管理后台") {
      setCurrTag(tagInLocalStorage);
    }
  };

  const handleSetSearch = (val: string) => {
    if (val !== "" && val) {
      setCurrTag("全部工具");
      setSearchString(val.trim());
    } else {
      resetSearch();
    }
  }

  const filteredData = useMemo(() => {
    if (data.tools) {
      const localResult = data.tools
        .filter((item: any) => {
          if (currTag === "全部工具") return true;
          return item.catelog === currTag;
        })
        .filter((item: any) => {
          if (searchString === "") return true;
          return (
            mutiSearch(item.name, searchString) ||
            mutiSearch(item.desc, searchString) ||
            mutiSearch(item.url, searchString)
          );
        });
      return localResult;
    } else {
      return [];
    }
  }, [data, currTag, searchString]);

  useEffect(() => {
    filteredDataRef.current = filteredData
    setLocalFilteredData(filteredData)
  }, [filteredData])

  const onKeyEnter = useCallback((ev: KeyboardEvent) => {
    const cards = filteredDataRef.current;
    if (ev.keyCode === 13) {
      if (cards && cards.length) {
        const url = cards[0]?.url;
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
        
        const variables = extractVariables(url);
        if (variables.length > 0) {
          // 如果有变量，不通过键盘导航直接打开，让用户通过点击卡片来输入变量
          return;
        } else {
          window.open(url, "_blank");
          resetSearch();
        }
      }
    }
    if (ev.ctrlKey || ev.metaKey) {
      const num = Number(ev.key);
      if (isNaN(num)) return;
      ev.preventDefault()
      const index = Number(ev.key) - 1;
      if (index >= 0 && index < cards.length) {
        const url = cards[index]?.url;
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
        
        const variables = extractVariables(url);
        if (variables.length > 0) {
          // 如果有变量，不通过键盘导航直接打开，让用户通过点击卡片来输入变量
          return;
        } else {
          window.open(url, "_blank");
          resetSearch();
        }
      }
    }
  }, []);

  useEffect(() => {
    if (searchString.trim() === "") {
      document.removeEventListener("keydown", onKeyEnter);
    } else {
      document.addEventListener("keydown", onKeyEnter);
    }
    return () => {
      document.removeEventListener("keydown", onKeyEnter);
    }
  }, [searchString, onKeyEnter])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id && over) {
      const oldIndex = localFilteredData.findIndex((i) => i.id === active.id);
      const newIndex = localFilteredData.findIndex((i) => i.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newData = arrayMove(localFilteredData, oldIndex, newIndex);
        setLocalFilteredData(newData);
        filteredDataRef.current = newData;

        if (loggedIn) {
          const updates = newData.map((item, index) => ({
            id: item.id,
            sort: index + 1,
          }));

          try {
            await fetchUpdateToolsSort(updates);
            loadData();
          } catch (e) {
            console.error("更新书签排序失败:", e);
          }
        }
      }
    }
  };

  const renderCardsV2 = () => {
    return localFilteredData.map((item, index) => {
      return (
        <CardV2
          id={item.id}
          title={item.name}
          url={item.url}
          des={item.desc}
          logo={item.logo}
          key={item.id}
          catelog={item.catelog}
          index={index}
          isSearching={searchString.trim() !== ""}
          catelogs={data?.catelogs || []}
          onRefresh={loadData}
          draggable={loggedIn}
          onClick={() => {
            resetSearch();
            if (item.url === "toggleJumpTarget") {
              toggleJumpTarget();
              loadData();
            }
          }}
        />
      );
    });
  };

  if (locked) {
    return <LockScreen onUnlock={loadData} />;
  }

  return (
    <div className={clsx("van-layout-root", styles.root)}>
      <Helmet>
        <meta charSet="utf-8" />
        <link
          rel="icon"
          href={data?.setting?.favicon ?? "favicon.ico"}
        />
        <title>{data?.setting?.title ?? "Van Nav"}</title>
      </Helmet>

      {/* Top Bar - Sticky */}
      {currentTheme.styles.searchBar?.visible !== false && (
        <div className={clsx("van-layout-header", styles.header)}>
          <div className={clsx("van-layout-header-content", styles.headerContent)}>
            <SearchBar
              searchString={val}
              setSearchText={(t) => {
                setVal(t);
                handleSetSearch(t);
              }}
            />
            <TagSelector
              tags={data?.catelogs ?? ["全部工具"]}
              currTag={currTag}
              onTagChange={handleSetCurrTag}
              catelogsData={data?.catelogsData || []}
              onRefresh={loadData}
            />
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className={clsx("van-layout-content", styles.contentContainer)}>
        {loading ? (
          <Loading />
        ) : localFilteredData.length > 0 ? (
          loggedIn ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={localFilteredData.map(i => i.id)} strategy={rectSortingStrategy}>
                <div className={clsx("van-layout-grid", styles.grid)} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(var(--card-min-width), 1fr))" }}>
                  {renderCardsV2()}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className={clsx("van-layout-grid", styles.grid)} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(var(--card-min-width), 1fr))" }}>
              {renderCardsV2()}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-300">
            <InboxIcon className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {searchString ? (
                <span>
                  没有找到与 <span className="font-medium text-gray-500 dark:text-gray-400">"{searchString}"</span> 相关的工具
                </span>
              ) : (
                "这里空空如也"
              )}
            </p>
          </div>
        )}
      </div>

      {/* Footer / Record */}
      <div className={clsx("van-layout-footer", styles.footer)}>
        <a href="https://beian.miit.gov.cn" target="_blank" rel="noreferrer" className="hover:text-gray-500 transition-colors">
          {data?.setting?.govRecord ?? ""}
        </a>
      </div>

      {showGithub && <GithubLink />}
      <DarkSwitch showGithub={showGithub} />
      <LoginButton showGithub={showGithub} />
      <AddToolButton
        catelogs={data?.catelogs || []}
        onSuccess={loadData}
        showGithub={showGithub}
      />
    </div>
  );
};

export default Content;
