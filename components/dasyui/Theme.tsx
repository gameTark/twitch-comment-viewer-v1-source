"use client";

import { MouseEventHandler, useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@resource/db";
import THEME from "@resource/theme.json";
import { getHtml } from "@libs/utils";

import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";

const defaultTheme = "lemonade";
const themeStorage = "theme-application-001";
const loadTheme = async () => {
  const theme = await db.settings.get(themeStorage);
  return theme?.value || defaultTheme;
};
export const useTheme = () => {
  useLiveQuery(async () => {
    const htmlElement = getHtml();
    const theme = await db.settings.get(themeStorage);
    if (theme == null) return;
    htmlElement.dataset.theme = theme.value;
  }, []);
};

// そのうち設定二移動させる
export const Theme = () => {
  const themes = useMemo(() => {
    return THEME.map((val) => {
      if (typeof val === "string") {
        return val;
      }
      return Object.keys(val);
    }).flat();
  }, [THEME]);
  const [theme, setTheme] = useState<string>();
  const saveTheme = useCallback((e: string) => {
    setTheme(e);
    db.settings.put({
      id: themeStorage,
      value: e,
    });
  }, []);

  const changeTheme: MouseEventHandler<HTMLButtonElement> = useCallback((ev) => {
    saveTheme(ev.currentTarget.value);
  }, []);

  useLiveQuery(() => {
    loadTheme().then((res) => {
      setTheme(res);
    });
  }, []);

  useEffect(() => {
    if (theme == null) return;
    const htmlElement = getHtml();
    htmlElement.dataset.theme = theme;
  }, [theme]);

  const scroll = usePerfectScrollbar([], {
    suppressScrollX: true,
  });

  const Content = (props: { type: string }) => (
    <div className={`w-2 rounded-badge h-6 flex items-center justify-center ${props.type}`}></div>
  );
  return (
    <div className="dropdown dropdown-bottom">
      <button tabIndex={0} className="btn btn-secondary w-48 btn-sm">
        {theme}
      </button>
      <div
        tabIndex={0}
        className="
          dropdown-content
          border
          z-[1]
          menu
          shadow
          bg-base-100
          rounded-box
          w-64
          h-96
        ">
        <div ref={scroll.ref} className={clsx("w-full perfect-scrollbar")}>
          <ul
            className="
            flex
            flex-col
            gap-2
          ">
            {themes.map((val) => {
              return (
                <li key={val}>
                  <button
                    className="btn w-full border"
                    onClick={changeTheme}
                    data-theme={val}
                    value={val}
                    disabled={theme === val}>
                    <div
                      className="
                      flex
                      gap-1
                      items-center
                      w-full
                    ">
                      <div className="text-left text-xs grow w-full">{val}</div>
                      <div className="flex gap-1 ml-auto">
                        <Content type="bg-primary text-primary-content" />
                        <Content type="bg-secondary text-secondary-content" />
                        <Content type="bg-accent text-accent-content" />
                        <Content type="bg-neutral text-neutral-content" />
                        <Content type="bg-base-100 text-base-content" />
                        <Content type="bg-info" />
                        <Content type="bg-success" />
                        <Content type="bg-warning" />
                        <Content type="bg-error" />
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
