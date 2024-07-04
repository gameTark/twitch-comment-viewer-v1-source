"use client";

import { MouseEventHandler, useCallback, useMemo, useState } from "react";
import { DBTheme, DEFAULT_CUSTOM, FONTS } from "@schemas/twitch/Theme";
import { useForm } from "react-hook-form";

import { DEFAULT_THEME } from "@resource/constants";
import THEME from "@resource/theme.json";

import { Diff } from "@components/dasyui/Diff";
import { ICONS } from "@components/icons";
import { ColorInput } from "../color";
import { useDialog } from "../Dialog";
import { Scroll } from "../PerfectScrollbar";
import { Theme } from "./context";
import { ColorContentDistance, StyleLoader } from "./style/decoder";
import { Preview } from "./style/preview";

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

const Editor = () => {
  const setTheme = Theme.uses.useSetThemeContext();
  const prevTheme = Theme.uses.useThemeContext();
  const [state, setState] = useState<DBTheme>(prevTheme || DEFAULT_CUSTOM);
  const form = useForm({
    mode: "onBlur",
    defaultValues: state,
  });
  const dialog = useDialog();

  const theme = useMemo(() => ColorContentDistance(state), [state]);
  const submit = useCallback((theme: DBTheme) => {
    setTheme.editTheme(theme.id, ColorContentDistance(theme));
  }, []);

  const deleteTheme = useCallback(() => {
    if (prevTheme == null) return;
    dialog.open({
      title: "削除しますか？",
      onSuccess: () => {
        setTheme.deleteTheme(prevTheme.id);
      },
    });
  }, [prevTheme]);
  return (
    <form
      className="flex flex-col border min-w-96"
      onBlur={form.handleSubmit(setState)}
      onSubmit={form.handleSubmit(submit)}>
      <Theme.FontLoader targetFamily={[state.font["font-family"]]} />
      <StyleLoader style={theme} />
      <Scroll className="w-full h-full">
        <h2 className=" px-4">テーマ編集</h2>
        <h3 className=" px-4">テーマ名</h3>
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

      <div className="col-span-5 flex justify-end sticky bottom-0 py-3 border-t-2 px-5 bg-base-300 gap-5">
        <button type="button" className="btn btn-sm btn-error" onClick={deleteTheme}>
          削除
        </button>
        <button className="btn btn-sm btn-info">保存</button>
      </div>
    </form>
  );
};

const PreviewComponent = () => {
  const currentTheme = Theme.uses.useCurrentThemeId();
  const themeList = Theme.uses.useThemeList();
  const [comparison, setComparison] = useState(DEFAULT_THEME);

  return (
    <Scroll borderd>
      <div className="px-10 pb-10">
        <h2>テーマプレビュー</h2>
        <div className="flex justify-start items-center gap-5">
          <h3 className="flex-none">比較対象</h3>
          <select
            className=" select select-bordered w-full select-lg"
            onChange={(e) => setComparison(e.currentTarget.value)}
            value={comparison}>
            {themeList.map((value) => (
              <option key={value.id} value={value.id}>
                {value.id}
              </option>
            ))}
          </select>
        </div>
        <h3>ボタン</h3>
        <Diff.Theme theme2={comparison} theme1={currentTheme} className="aspect-[4/2]">
          {Preview.Button}
        </Diff.Theme>
        <h3>バッヂ</h3>
        <Diff.Theme theme2={comparison} theme1={currentTheme} className="aspect-[5/2]">
          {Preview.Badge}
        </Diff.Theme>
        <h3>リンク</h3>
        <Diff.Theme theme2={comparison} theme1={currentTheme} className="aspect-[5/2]">
          {Preview.Link}
        </Diff.Theme>
        <h3>プログレスバー</h3>
        <Diff.Theme theme2={comparison} theme1={currentTheme} className="aspect-[5/2]">
          {Preview.Progress}
        </Diff.Theme>
        <h3>インフォ</h3>
        <Diff.Theme theme2={comparison} theme1={currentTheme} className="aspect-[4/3]">
          {Preview.Info}
        </Diff.Theme>
        <h3>全量</h3>
        <Diff.Theme theme2={comparison} theme1={currentTheme} className="aspect-[4/5]">
          <Preview.Full />
        </Diff.Theme>
      </div>
    </Scroll>
  );
};

export const Select = () => {
  const currentTheme = Theme.uses.useCurrentThemeId();
  const setTheme = Theme.uses.useSetThemeContext();
  const createTheme = Theme.uses.useCreateTheme();
  const baseTheme = useMemo(() => {
    return [...THEME];
  }, [THEME]);
  return (
    <div>
      <Scroll className="border px-6 w-80">
        <div className="pb-10">
          <h2>テーマ選択</h2>
          <h3>カスタムテーマ</h3>
          <ul className="flex flex-col gap-3">
            <Theme.ThemeListProvider>
              <li>
                <Theme.List.ThemeListItem />
              </li>
            </Theme.ThemeListProvider>
            <li>
              <button className="btn btn-outline btn-info w-full" onClick={createTheme}>
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
                  disabled={currentTheme === theme}
                  onClick={() => setTheme.setTheme(theme)}
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
  const currentTheme = Theme.uses.useCurrentThemeId();
  return (
    <div className="h-full flex flex-col w-full">
      <h1>設定</h1>
      <div className="flex gap-5 grow h-0 w-full">
        <Select />
        <div className="flex w-min">
          {currentTheme == null ? null : (
            <Theme.Provider themeId={currentTheme} key={currentTheme}>
              <Editor key={currentTheme} />
            </Theme.Provider>
          )}
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
