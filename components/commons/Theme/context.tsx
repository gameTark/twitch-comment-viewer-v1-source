"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { DBTheme, DBThemeSchema } from "@schemas/twitch/Theme";

import { DEFAULT_THEME } from "@resource/constants";
import THEME from "@resource/theme.json";
import { is } from "@libs/is";
import { Storage } from "@libs/storage";
import { getHtml } from "@libs/utils";

import { FontLoader, StyleLoader } from "./style/decoder";

const currentThemeStorage = new Storage<{ theme: string }>("CURRENT_THEME", {
  defaultValue: {
    theme: DEFAULT_THEME,
  },
});
const themeStorage = new Storage<ThemeStorageType>("THEME_STORAGE", {
  defaultValue: {},
});

type ThemeStorageType = { [key in DBTheme["id"]]: DBTheme };
const themeContext = createContext<DBTheme | null>(null);
const themeStorageContext = createContext<ThemeStorageType>({});
const currentThemeContext = createContext<{ id: string }>({
  id: DEFAULT_THEME,
});
const setThemeContext = createContext<{
  setTheme: (id: DBTheme["id"]) => void;
  addTheme: (theme: DBTheme) => void;
  editTheme: (id: DBTheme["id"], theme: DBTheme) => void;
  deleteTheme: (id: DBTheme["id"]) => void;
}>({
  setTheme: () => {},
  addTheme: () => {},
  editTheme: () => {},
  deleteTheme: () => {},
});

const useThemeContext = () => useContext(themeContext);
const useThemeStorageContext = () => useContext(themeStorageContext);
const useSetThemeContext = () => useContext(setThemeContext);
const useCurrentThemeContext = () => useContext(currentThemeContext);
const useCurrentThemeId = () => {
  const currentTheme = useCurrentThemeContext().id;
  const [targetTheme, setTargetTheme] = useState<string>("");
  useLayoutEffect(() => {
    setTargetTheme(currentTheme);
  }, [currentTheme]);
  return targetTheme;
};

export const ThemeGrobalProvider = (props: { children: ReactNode }) => {
  const [themes, setThemes] = useState<ThemeStorageType>({});
  const [currentTheme, setCurrentTheme] = useState<{ theme: string }>();

  useLayoutEffect(() => {
    const item = themeStorage.getItem();
    if (item == null) return;
    setThemes(item);
  }, []);

  useLayoutEffect(() => {
    const item = currentThemeStorage.getItem();
    if (item == null) return;
    setCurrentTheme(item);
  }, []);

  const setTheme = useCallback((id: DBTheme["id"]) => {
    setCurrentTheme({
      theme: id,
    });
  }, []);

  const addTheme = useCallback((theme: DBTheme) => {
    setThemes((prev) => {
      return {
        ...prev,
        [theme.id]: theme,
      };
    });
  }, []);

  const editTheme = useCallback((id: DBTheme["id"], theme: DBTheme) => {
    setThemes((prev) => {
      return {
        ...prev,
        [id]: theme,
      };
    });
  }, []);

  const deleteTheme = useCallback((id: DBTheme["id"]) => {
    setThemes((prev) => {
      delete prev[id];
      return {
        ...prev,
      };
    });
  }, []);

  useLayoutEffect(() => {
    if (is.runner.server) return;
    const htmlElement = getHtml();
    htmlElement.dataset.theme = currentTheme?.theme;
  }, [currentTheme]);

  useEffect(() => {
    if (currentTheme?.theme == null) return;
    currentThemeStorage.setItem({ theme: currentTheme?.theme });
  }, [currentTheme]);

  useEffect(() => {
    themeStorage.setItem(themes);
  }, [themes]);

  return (
    <currentThemeContext.Provider value={{ id: currentTheme?.theme || DEFAULT_THEME }}>
      <setThemeContext.Provider
        value={{
          setTheme,
          addTheme,
          editTheme,
          deleteTheme,
        }}>
        <themeStorageContext.Provider value={themes}>
          <ThemeStyles />
          {props.children}
        </themeStorageContext.Provider>
      </setThemeContext.Provider>
    </currentThemeContext.Provider>
  );
};

/**
 * 適用させるためのスタイル
 */
const ThemeStyles = () => {
  const themes = useThemeStorageContext();
  const [themeItems, setThemeItems] = useState<DBTheme[]>([]);
  const currentTheme = useCurrentThemeId();
  useLayoutEffect(() => {
    setThemeItems(Object.values(themes));
  }, [themes]);
  if (currentTheme == null) return <></>;
  return (
    <>
      <FontLoader targetFamily={[themes[currentTheme]?.font["font-family"]]} />
      {themeItems.map((val) => (
        <StyleLoader style={val} key={val.id} />
      ))}
    </>
  );
};

const useCreateTheme = () => {
  const useSetTheme = useSetThemeContext();
  return useCallback(() => {
    useSetTheme.addTheme(DBThemeSchema.parse({}));
  }, []);
};

const Provider = (props: { themeId: DBTheme["id"]; children?: ReactNode }) => {
  const theme = useThemeStorageContext();
  const targetTheme = useMemo(() => {
    return theme[props.themeId];
  }, [props.themeId]);
  if (targetTheme == null) return null;
  return <themeContext.Provider value={targetTheme}>{props.children}</themeContext.Provider>;
};
const ThemeListProvider = (props: { children: ReactNode }) => {
  const theme = useThemeStorageContext();
  const themeList = useMemo(() => {
    return Object.values(theme);
  }, [theme]);
  return (
    <>
      {themeList.map((val) => (
        <themeContext.Provider value={val} key={val.id}>
          {props.children}
        </themeContext.Provider>
      ))}
    </>
  );
};

const Content = (props: { type: string }) => (
  <div className={`w-2 rounded-badge h-6 flex items-center justify-center ${props.type}`}></div>
);

const ThemeListItem = () => {
  const context = useThemeContext();
  const currentTheme = useCurrentThemeId();
  const setTheme = Theme.uses.useSetThemeContext();

  if (context == null) return <></>;
  return (
    <div>
      <button
        className="btn w-full border"
        onClick={() => setTheme.setTheme(context.id)}
        data-theme={context.id}
        value={context.id}
        disabled={context.id === currentTheme}>
        <div className="flex w-full justify-between items-center">
          <div className="text-left text-xs grow w-full">{context.title}</div>
          <div className="flex gap-1 ml-auto">
            <Content type="bg-primary" />
            <Content type="bg-secondary " />
            <Content type="bg-accent" />
            <Content type="bg-neutral" />
            <Content type="bg-info" />
            <Content type="bg-success" />
            <Content type="bg-warning" />
            <Content type="bg-error" />
          </div>
        </div>
      </button>
    </div>
  );
};

const useThemeList = (): {
  isTemplate: boolean;
  id: string;
  displayName: string;
}[] => {
  const themeTemplate = useThemeStorageContext();
  return useMemo(() => {
    return [
      ...THEME.map((val) => ({
        isTemplate: true,
        id: val,
        displayName: val,
      })),
      ...Object.values(themeTemplate).map((val) => ({
        isTemplate: false,
        id: val.id,
        displayName: val.title,
      })),
    ];
  }, [THEME, themeTemplate]);
};

export const Theme = {
  uses: {
    useSetThemeContext,
    useCreateTheme,
    useCurrentThemeId,
    useThemeContext,
    useThemeList,
  },
  ThemeStyles,
  ThemeListProvider,
  Provider,
  FontLoader,
  List: {
    ThemeListItem,
  },
};
