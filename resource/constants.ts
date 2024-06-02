import Profile404 from "@assets/images/404Profile.png";
import None from "@assets/images/None.png";

import { is } from "@libs/is";

export const CONFIG = {
  API_KEY: "of40zatnkd1ftcaqnf92ahqznkg1vn",
  OAUTH: {
    REDIRECT_URI: is.build.production
      ? "https://gametark.github.io/twitch-comment-viewer-v1-frontend"
      : "http://localhost:3000",
    TYPE: "token",
    SCOPE:
      "user:edit clips:edit user:read:chat channel:read:redemptions analytics:read:games moderator:read:chatters moderator:read:followers channel_editor",
  },
  DEBUG: true,
};

export const MAX_TIMESTAMP = 8640000000000000;
export const MIN_TIMESTAMP = 0;
export const IMAGES = {
  PROFILE_404: {
    src: Profile404.src,
    alt: "Profile404",
  },
  NONE: {
    src: None.src,
    alt: "None",
  },
};

export const FONTS: { [key in string]: string } = {
  "Noto+Sans+JP:wght@100..900": "Noto Sans JP",
  "Noto+Serif+JP": "Noto Serif JP",
  "M+PLUS+Rounded+1c": "M PLUS Rounded 1c",
  "Hina+Mincho": "Hina Mincho",
  "Kaisei+HarunoUmi": "Kaisei HarunoUmi",
  "Yuji+Mai": "Yuji Mai",
  "Yuji+Boku": "Yuji Boku",
  "DotGothic16": "DotGothic16",
  "Zen+Maru+Gothic": "Zen Maru Gothic",
  "Shippori+Antique+B1": "Shippori Antique B1",
};

export const parseTheme = (style: Style[]) => `
[data-theme=custom] {${style
  .map((val) => val.values)
  .flat()
  .map((val) => `  ${val.cssVariable}: ${val.defaultValue};`)
  .join("\n")}
}`;
export interface Style {
  title: string;
  values: {
    displayName: string;
    cssVariable: string;
    defaultValue: string;
  }[];
}
export const DEFAULT_THEME = "lemonade";

export interface CustomTheme {
  title: string;
  font: {
    "font-size": string;
    "font-family": string;
  };
  colors: {
    "--b1": string;
    "--b2": string;
    "--b3": string;
    "--bc": string;
    "--p": string;
    "--pc": string;
    "--s": string;
    "--sc": string;
    "--a": string;
    "--ac": string;
    "--n": string;
    "--nc": string;
    "--in": string;
    "--inc": string;
    "--su": string;
    "--suc": string;
    "--wa": string;
    "--wac": string;
    "--er": string;
    "--erc": string;
  };

  rounded: {
    // 基本rem
    "--rounded-box": string;
    "--rounded-badge": string;
    "--rounded-btn": string;
    "--tab-radius": string;
  };
}
export const DEFAULT_CUSTOM: CustomTheme = {
  title: "新規作成テーマ",
  font: {
    "font-size": "16",
    "font-family": "Noto+Sans+JP:wght@100..900",
  },
  colors: {
    "--b1": "0.951276 0.007445 260.731582",
    "--b2": "0.932996 0.010389 261.788512",
    "--b3": "0.899257 0.016374 262.74927",
    "--bc": "0.324374 0.022944 264.182039",
    "--p": "0.594359 0.077246 254.027778",
    "--pc": "0.324374 0.022944 264.182039",
    "--s": "0.696515 0.059108 248.687195",
    "--sc": "0.324374 0.022944 264.182039",
    "--a": "0.774643 0.062248 217.469037",
    "--ac": "0.324374 0.022944 264.182039",
    "--n": "0.45229 0.035213 264.131203",
    "--nc": "0.324374 0.022944 264.182039",
    "--in": "0.692071 0.062496 332.664901",
    "--inc": "0.324374 0.022944 264.182039",
    "--su": "0.768269 0.074899 131.063076",
    "--suc": "0.324374 0.022944 264.182039",
    "--wa": "0.854862 0.089234 84.093332",
    "--wac": "0.324374 0.022944 264.182039",
    "--er": "0.606099 0.120594 15.341872",
    "--erc": "0.324374 0.022944 264.182039",
  },
  rounded: {
    // 基本rem
    "--rounded-box": "1",
    "--rounded-badge": "1.9",
    "--rounded-btn": "1.9",
    "--tab-radius": "0.7",
  },
};

// --border-btn: 1px;
// --btn-focus-scale: 0.95;
// --tab-border: 2px;
// --tab-radius: 0.7rem;
// --animation-btn: 0.25s;
// --animation-input: .2s;

export const DEFAULT_CUSTOM_STYLE: Style[] = [
  {
    title: "フォント",
    values: [
      {
        displayName: "サイズ",
        cssVariable: "font-size",
        defaultValue: "16px",
      },
      {
        displayName: "フォント",
        cssVariable: "font-family",
        defaultValue: "Noto Sans JP",
      },
    ],
  },
  {
    title: "基本色",
    values: [
      {
        displayName: "背景色1",
        cssVariable: "--b1",
        defaultValue: "0.951276 0.007445 260.731539",
      },
      {
        displayName: "背景色2",
        cssVariable: "--b2",
        defaultValue: "0.932996 0.010389 261.788485",
      },
      {
        displayName: "背景色3",
        cssVariable: "--b3",
        defaultValue: "0.899258 0.016374 262.749256",
      },
      {
        displayName: "基本文字色",
        cssVariable: "--bc",
        defaultValue: "0.324374 0.022945 264.182036",
      },
    ],
  },
  {
    title: "プライマリ",
    values: [
      {
        displayName: "背景色",
        cssVariable: "--p",
        defaultValue: "0.594359 0.077246 254.027774",
      },
      {
        displayName: "文字色",
        cssVariable: "--pc",
        defaultValue: "0.118872 0.015449 254.027774",
      },
    ],
  },
  {
    title: "セカンダリ",
    values: [
      {
        displayName: "背景色",
        cssVariable: "--s",
        defaultValue: "0.696516 0.059108 248.687186",
      },
      {
        displayName: "文字色",
        cssVariable: "--sc",
        defaultValue: "0.139303 0.011822 248.687186",
      },
    ],
  },
  {
    title: "アクセント",
    values: [
      {
        displayName: "背景色",
        cssVariable: "--a",
        defaultValue: "0.774643 0.062249 217.469017",
      },
      {
        displayName: "文字色",
        cssVariable: "--ac",
        defaultValue: "0.154929 0.01245 217.469017",
      },
    ],
  },
  {
    title: "ナチュラル",
    values: [
      {
        displayName: "背景色",
        cssVariable: "--n",
        defaultValue: "0.45229 0.035214 264.1312",
      },
      {
        displayName: "文字色",
        cssVariable: "--nc",
        defaultValue: "0.899258 0.016374 262.749256",
      },
    ],
  },
  {
    title: "情報",
    values: [
      {
        displayName: "背景色",
        cssVariable: "--in",
        defaultValue: "0.692072 0.062496 332.664922",
      },
      {
        displayName: "文字色",
        cssVariable: "--inc",
        defaultValue: "0.138414 0.012499 332.664922",
      },
    ],
  },
  {
    title: "成功",
    values: [
      {
        displayName: "背景色",
        cssVariable: "--su",
        defaultValue: "0.76827 0.074899 131.063061",
      },
      {
        displayName: "文字色",
        cssVariable: "--suc",
        defaultValue: "0.153654 0.01498 131.063061",
      },
    ],
  },
  {
    title: "警告",
    values: [
      {
        displayName: "背景色",
        cssVariable: "--wa",
        defaultValue: "0.854862 0.089234 84.093335",
      },
      {
        displayName: "文字色",
        cssVariable: "--wac",
        defaultValue: "0.170972 0.017847 84.093335",
      },
    ],
  },
  {
    title: "エラー",
    values: [
      {
        displayName: "背景色",
        cssVariable: "--er",
        defaultValue: "0.6061 0.120594 15.341883",
      },
      {
        displayName: "文字色",
        cssVariable: "--erc",
        defaultValue: "0.12122 0.024119 15.341883",
      },
    ],
  },
];
