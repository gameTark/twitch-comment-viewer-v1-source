"use client";

import { MouseEventHandler, useCallback, useLayoutEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useForm } from "react-hook-form";

import { CustomTheme, DEFAULT_CUSTOM, DEFAULT_THEME, FONTS } from "@resource/constants";
import THEME from "@resource/theme.json";
import { is } from "@libs/is";
import { useAsyncMemo } from "@libs/uses";
import { getHtml } from "@libs/utils";

import { Diff } from "@components/dasyui/Diff";
import { ICONS } from "@components/icons";
import { ColorInput } from "../color";
import { Scroll } from "../PerfectScrollbar";
import { Preview } from "./PreviewComponent";

const THEME_STORAGE_KEY = "theme-storage";
const CURRENT_THEME_KEY = "theme-application-001";
interface Style {
  title: string;
  values: {
    displayName: string;
    cssVariable: string;
    defaultValue: string;
  }[];
}

interface Theme {
  name: string;
  style: Style[];
}
const parseTheme = (style: Style[]) => `
[data-theme=custom] {${style
  .map((val) => val.values)
  .flat()
  .map((val) => `  ${val.cssVariable}: ${val.defaultValue};`)
  .join("\n")}
}`;

const themeAsset = {
  save: (theme: Theme[]) => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    window.dispatchEvent(new Event("storage"));
  },
  load: () => (localStorage.getItem(THEME_STORAGE_KEY) || []) as Theme[],
};
const currentThemeStorage = {
  save: (theme: string) => {
    localStorage.setItem(CURRENT_THEME_KEY, theme);
    window.dispatchEvent(new Event("storage"));
  },
  load: () => localStorage.getItem(CURRENT_THEME_KEY) || DEFAULT_THEME,
};

export const FontLoader = (props: { targetFamily: string[] }) => {
  const font = useMemo(() => {
    return `https://fonts.googleapis.com/css2?${props.targetFamily.map((val) => `family=${val}`).join("&")}&display=swap`;
  }, [props.targetFamily]);
  if (props.targetFamily.length === 0) return <></>;
  return <link href={font} rel="stylesheet" />;
};
export const applyTheme = () => {
  if (is.runner.server) return;
  const htmlElement = getHtml();
  htmlElement.dataset.theme = currentThemeStorage.load();
};

export const ApplyTheme = () => {
  useLayoutEffect(() => {
    applyTheme();
    const storageEvent = (storageEvent: StorageEvent) => {
      applyTheme();
      return storageEvent;
    };
    window.addEventListener("storage", storageEvent);
    return () => {
      window.removeEventListener("storage", storageEvent);
    };
  }, []);
  return <></>;
};

const ThemeStyle = (props: { style: CustomTheme; themeName: string }) => {
  return (
    <style>
      {`
[data-theme=${props.themeName}] {
font-size: ${props.style.font["font-size"]}px;
font-family: ${FONTS[props.style.font["font-family"]]};
  ${Object.entries(props.style.colors)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n")};
${Object.entries(props.style.rounded)
  .map(([key, value]) => `${key}: ${value}rem;`)
  .join("\n")};
}
`}
    </style>
  );
};

const Editor = () => {
  const [state, setState] = useState<typeof DEFAULT_CUSTOM>(DEFAULT_CUSTOM);
  const form = useForm({
    mode: "onBlur",
    defaultValues: DEFAULT_CUSTOM,
  });

  const theme: CustomTheme = useMemo(() => {
    return {
      ...state,
      colors: {
        ...state.colors,
        ["--pc"]: ColorInput.methods.hexDistance(
          ColorInput.methods.toString(state.colors["--p"]),
          [state.colors["--b1"], state.colors["--bc"]].map(ColorInput.methods.toString),
        ),
        ["--sc"]: ColorInput.methods.hexDistance(
          ColorInput.methods.toString(state.colors["--s"]),
          [state.colors["--b1"], state.colors["--bc"]].map(ColorInput.methods.toString),
        ),
        ["--ac"]: ColorInput.methods.hexDistance(
          ColorInput.methods.toString(state.colors["--a"]),
          [state.colors["--b1"], state.colors["--bc"]].map(ColorInput.methods.toString),
        ),
        ["--nc"]: ColorInput.methods.hexDistance(
          ColorInput.methods.toString(state.colors["--n"]),
          [state.colors["--b1"], state.colors["--bc"]].map(ColorInput.methods.toString),
        ),
        ["--inc"]: ColorInput.methods.hexDistance(
          ColorInput.methods.toString(state.colors["--in"]),
          [state.colors["--b1"], state.colors["--bc"]].map(ColorInput.methods.toString),
        ),
        ["--suc"]: ColorInput.methods.hexDistance(
          ColorInput.methods.toString(state.colors["--su"]),
          [state.colors["--b1"], state.colors["--bc"]].map(ColorInput.methods.toString),
        ),
        ["--wac"]: ColorInput.methods.hexDistance(
          ColorInput.methods.toString(state.colors["--wa"]),
          [state.colors["--b1"], state.colors["--bc"]].map(ColorInput.methods.toString),
        ),
        ["--erc"]: ColorInput.methods.hexDistance(
          ColorInput.methods.toString(state.colors["--er"]),
          [state.colors["--b1"], state.colors["--bc"]].map(ColorInput.methods.toString),
        ),
      },
    };
  }, [state]);

  return (
    <form className="flex flex-col border min-w-96" onBlur={form.handleSubmit(setState)}>
      <FontLoader targetFamily={[state.font["font-family"]]} />
      <ThemeStyle style={theme} themeName="example" />
      <Scroll className="w-full h-full">
        <h2 className=" px-4">テーマ編集</h2>
        <h3 className=" px-4">テーマ名</h3>
        {/* TODO: セクション管理が雑いからh区切りにリファクタしたい */}
        <div className="grid grid-cols-[1fr_repeat(4,max-content)] items-center w-full px-4 gap-x-4">
          <div className="col-start-1 col-span-full">
            <input
              type="text"
              className="input input-bordered text-right w-full"
              {...form.register("title")}
            />
          </div>

          <h3 className="col-span-full">フォント</h3>

          <p className=" col-start-1 font-bold">フォントサイズ</p>
          <div className="col-span-4 flex items-center gap-2">
            <input
              type="number"
              className="input input-sm input-bordered text-right"
              {...form.register("font.font-size")}
            />
            <p>px</p>
          </div>

          <p className="col-start-1 font-bold">フォント</p>
          <div className="col-span-4">
            <select
              className=" select select-bordered w-full select-sm"
              {...form.register("font.font-family")}>
              {Object.entries(FONTS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <h3 className="col-span-full">文字</h3>

          <p className="col-start-1 font-bold">文字</p>
          <p>基本</p>
          <ColorInput.DefaultPicker control={form.control} name="colors.--bc" />

          <h3 className="col-span-full">背景</h3>

          <p className="row-span-2 col-start-1 font-bold">背景</p>

          <p>背景1</p>
          <ColorInput.DefaultPicker control={form.control} name="colors.--b1" />

          <p>背景2</p>
          <ColorInput.DefaultPicker control={form.control} name="colors.--b2" />
          <p>背景3</p>
          <ColorInput.DefaultPicker control={form.control} name="colors.--b3" />

          <p className="font-bold col-start-1">プライマリ</p>
          <p>背景</p>
          <ColorInput.DefaultPicker control={form.control} name="colors.--p" />

          <p className="font-bold col-start-1">セカンダリ</p>
          <p>背景</p>
          <ColorInput.DefaultPicker control={form.control} name="colors.--s" />

          <p className="font-bold col-start-1">アクセント</p>
          <p>背景</p>
          <ColorInput.DefaultPicker control={form.control} name="colors.--a" />

          <p className="font-bold col-start-1">ナチュラル</p>
          <p>背景</p>
          <ColorInput.DefaultPicker control={form.control} name="colors.--n" />

          <p className="font-bold col-start-1">情報</p>
          <p>背景</p>
          <ColorInput.DefaultPicker control={form.control} name="colors.--in" />

          <p className="font-bold col-start-1">成功</p>
          <p>背景</p>
          <ColorInput.DefaultPicker control={form.control} name="colors.--su" />

          <p className="font-bold col-start-1">警戒</p>
          <p>背景</p>
          <ColorInput.DefaultPicker control={form.control} name="colors.--wa" />

          <p className="font-bold col-start-1">エラー</p>
          <p>背景</p>
          <ColorInput.DefaultPicker control={form.control} name="colors.--er" />

          <h3 className="col-span-full">角丸</h3>
          <p className="font-bold">箱</p>
          <div className="col-start-2 col-span-full">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              className="range"
              {...form.register("rounded.--rounded-box")}
            />
          </div>
          <p className="font-bold">バッヂ</p>
          <div className="col-start-2 col-span-full">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              className="range"
              {...form.register("rounded.--rounded-badge")}
            />
          </div>
          <p className="font-bold">ボタン</p>
          <div className="col-start-2 col-span-full">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              className="range"
              {...form.register("rounded.--rounded-btn")}
            />
          </div>
        </div>
      </Scroll>

      <div className="col-span-5 flex justify-end sticky bottom-0 py-3 border-t-2 px-5 bg-base-300">
        <button className="btn btn-sm">保存</button>
      </div>
    </form>
  );
};
const PreviewComponent = () => {
  return (
    <Scroll borderd>
      <div className="px-10 pb-10">
        <h2>テーマプレビュー</h2>
        <h3>ボタン</h3>
        <Diff.Theme theme="example" className="aspect-[4/2]">
          {Preview.Button}
        </Diff.Theme>
        <h3>バッヂ</h3>
        <Diff.Theme theme="example" className="aspect-[5/2]">
          {Preview.Badge}
        </Diff.Theme>
        <h3>リンク</h3>
        <Diff.Theme theme="example" className="aspect-[5/2]">
          {Preview.Link}
        </Diff.Theme>
        <h3>プログレスバー</h3>
        <Diff.Theme theme="example" className="aspect-[5/2]">
          {Preview.Progress}
        </Diff.Theme>
        <h3>インフォ</h3>
        <Diff.Theme theme="example" className="aspect-[4/3]">
          {Preview.Info}
        </Diff.Theme>
        <h3>全量</h3>
        <Diff.Theme theme="example" className="aspect-[4/5]">
          <Preview.Full />
        </Diff.Theme>
      </div>
    </Scroll>
  );
};
export const Select = () => {
  const currentTheme = useChangeTheme();
  const baseTheme = useMemo(() => {
    return [...THEME];
  }, [THEME]);
  const customTheme = useMemo(() => {
    return ["example"];
  }, []);
  return (
    <div>
      <Scroll className="border px-6 w-80">
        <div className="pb-10">
          <h2>テーマ選択</h2>
          <h3>カスタムテーマ</h3>
          <ul className="flex flex-col gap-3">
            {customTheme.map((theme) => (
              <li key={theme}>
                <ThemePreviewItem
                  theme={theme}
                  disabled={currentTheme.currentTheme === theme}
                  onClick={() => currentTheme.changeTheme(theme)}
                />
              </li>
            ))}
            <li>
              <button className="btn btn-outline btn-info w-full">
                テーマを新規追加 {ICONS.PLUS}
              </button>
            </li>
          </ul>
          <h3>基本テーマ</h3>
          <ul className="flex flex-col gap-3">
            {baseTheme.map((theme) => (
              <li key={theme}>
                <ThemePreviewItem
                  theme={theme}
                  disabled={currentTheme.currentTheme === theme}
                  onClick={() => currentTheme.changeTheme(theme)}
                />
              </li>
            ))}
          </ul>
        </div>
      </Scroll>
    </div>
  );
};

export const ThemeEditor = () => {
  return (
    <div className="h-full flex flex-col w-full">
      <h1>設定</h1>
      <div className="flex gap-5 grow h-0 w-full">
        <Select />
        <div className="flex w-min">
          <Editor />
        </div>
        <div className="min-w-[700px]">
          <PreviewComponent />
        </div>
      </div>
    </div>
  );
};

const Content = (props: { type: string }) => (
  <div className={`w-2 rounded-badge h-6 flex items-center justify-center ${props.type}`}></div>
);

const ThemePreviewItem = (props: {
  theme: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <button
      data-theme={props.theme}
      className="btn w-full"
      onClick={props.onClick}
      disabled={props.disabled}>
      <div className="flex w-full justify-between items-center">
        <div className="text-left text-xs grow w-full">{props.theme}</div>
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
  );
};

const useChangeTheme = () => {
  const [theme, setTheme] = useState<string>();
  useLayoutEffect(() => {
    setTheme(currentThemeStorage.load());
  }, []);
  const saveTheme = useCallback((theme: string) => {
    setTheme(theme);
    currentThemeStorage.save(theme);
  }, []);

  return {
    currentTheme: theme,
    changeTheme: saveTheme,
  };
};

export const ChangeTheme = () => {
  const theme = useChangeTheme();
  const themes = useAsyncMemo(async () => {
    return [...THEME, "example", ...themeAsset.load().map((val) => val.name)];
  }, [THEME]);
  const changeTheme: MouseEventHandler<HTMLButtonElement> = useCallback((ev) => {
    theme.changeTheme(ev.currentTarget.value);
  }, []);

  return (
    <div className="dropdown dropdown-bottom">
      <button tabIndex={0} className="btn btn-secondary w-48 btn-sm">
        {theme.currentTheme}
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
        <Scroll className={clsx("w-full")}>
          <ul
            className="
            flex
            flex-col
            gap-2
          ">
            {themes?.map((val) => {
              return (
                <li key={val}>
                  <button
                    className="btn w-full border"
                    onClick={changeTheme}
                    data-theme={val}
                    value={val}
                    disabled={theme.currentTheme === val}>
                    <ThemePreviewItem theme={val} />
                  </button>
                </li>
              );
            })}
          </ul>
        </Scroll>
      </div>
    </div>
  );
};
export default {
  parseTheme,
};
