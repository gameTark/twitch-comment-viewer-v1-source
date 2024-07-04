import { v4 as uuid } from "uuid";
import * as z from "zod";

const Font = z.object({
  "font-size": z.string().default("16"),
  "font-family": z.string().default("Noto+Sans+JP:wght@100..900"),
});

const Colors = z.object({
  "--b1": z.string().optional().default("0.951276 0.007445 260.731582"),
  "--b2": z.string().optional().default("0.932996 0.010389 261.788512"),
  "--b3": z.string().optional().default("0.899257 0.016374 262.74927"),
  "--bc": z.string().optional().default("0.324374 0.022944 264.182039"),
  "--p": z.string().optional().default("0.594359 0.077246 254.027778"),
  "--pc": z.string().optional().default("0.324374 0.022944 264.182039"),
  "--s": z.string().optional().default("0.696515 0.059108 248.687195"),
  "--sc": z.string().optional().default("0.324374 0.022944 264.182039"),
  "--a": z.string().optional().default("0.774643 0.062248 217.469037"),
  "--ac": z.string().optional().default("0.324374 0.022944 264.182039"),
  "--n": z.string().optional().default("0.45229 0.035213 264.131203"),
  "--nc": z.string().optional().default("0.324374 0.022944 264.182039"),
  "--in": z.string().optional().default("0.692071 0.062496 332.664901"),
  "--inc": z.string().optional().default("0.324374 0.022944 264.182039"),
  "--su": z.string().optional().default("0.768269 0.074899 131.063076"),
  "--suc": z.string().optional().default("0.324374 0.022944 264.182039"),
  "--wa": z.string().optional().default("0.854862 0.089234 84.093332"),
  "--wac": z.string().optional().default("0.324374 0.022944 264.182039"),
  "--er": z.string().optional().default("0.606099 0.120594 15.341872"),
  "--erc": z.string().optional().default("0.324374 0.022944 264.182039"),
});

const Rounded = z.object({
  "--rounded-badge": z.string().optional().default("1"),
  "--rounded-box": z.string().optional().default("1.9"),
  "--rounded-btn": z.string().optional().default("1.9"),
  "--tab-radius": z.string().optional().default("0.7"),
});

export const DBThemeIndex = "++id,title";
export const DBThemeSchema = z.object({
  id: z
    .string()
    .optional()
    .default(() => "style" + uuid().replaceAll("-", "")),
  title: z.string().optional().default("新規作成テーマ"),
  font: Font.optional().default(Font.parse({})),
  colors: Colors.optional().default(Colors.parse({})),
  rounded: Rounded.optional().default(Rounded.parse({})),
});
export type DBTheme = z.infer<typeof DBThemeSchema>;
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

export const DEFAULT_CUSTOM: DBTheme = DBThemeSchema.parse({
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
});
