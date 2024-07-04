import { useMemo } from "react";
import { DBTheme, FONTS } from "@schemas/twitch/Theme";

import { ColorInput } from "@components/commons/color";

export const FontLoader = (props: { targetFamily: string[] }) => {
  const font = useMemo(() => {
    return `https://fonts.googleapis.com/css2?${props.targetFamily.map((val) => `family=${val}`).join("&")}&display=swap`;
  }, [props.targetFamily]);
  if (props.targetFamily.length === 0) return <></>;
  return <link href={font} rel="stylesheet" />;
};

export const StyleLoader = (props: { style: DBTheme }) => {
  const { style } = props;
  return (
    <>
      <style>
        {`
[data-theme=${style.id}] {
  font-size: ${style.font["font-size"]}px;
  font-family: ${FONTS[style.font["font-family"]]};
${Object.entries(style.colors)
  .map(([key, value]) => `  ${key}: ${value};`)
  .join("\n")}
${Object.entries(style.rounded)
  .map(([key, value]) => `  ${key}: ${value}rem;`)
  .join("\n")}
}`}
      </style>
    </>
  );
};

export const ColorContentDistance = (theme: DBTheme) => {
  return {
    ...theme,
    colors: {
      ...theme.colors,
      ["--pc"]: ColorInput.methods.hexDistance(
        ColorInput.methods.str(theme.colors["--p"]),
        [theme.colors["--b1"], theme.colors["--bc"]].map(ColorInput.methods.str),
      ),
      ["--sc"]: ColorInput.methods.hexDistance(
        ColorInput.methods.str(theme.colors["--s"]),
        [theme.colors["--b1"], theme.colors["--bc"]].map(ColorInput.methods.str),
      ),
      ["--ac"]: ColorInput.methods.hexDistance(
        ColorInput.methods.str(theme.colors["--a"]),
        [theme.colors["--b1"], theme.colors["--bc"]].map(ColorInput.methods.str),
      ),
      ["--nc"]: ColorInput.methods.hexDistance(
        ColorInput.methods.str(theme.colors["--n"]),
        [theme.colors["--b1"], theme.colors["--bc"]].map(ColorInput.methods.str),
      ),
      ["--inc"]: ColorInput.methods.hexDistance(
        ColorInput.methods.str(theme.colors["--in"]),
        [theme.colors["--b1"], theme.colors["--bc"]].map(ColorInput.methods.str),
      ),
      ["--suc"]: ColorInput.methods.hexDistance(
        ColorInput.methods.str(theme.colors["--su"]),
        [theme.colors["--b1"], theme.colors["--bc"]].map(ColorInput.methods.str),
      ),
      ["--wac"]: ColorInput.methods.hexDistance(
        ColorInput.methods.str(theme.colors["--wa"]),
        [theme.colors["--b1"], theme.colors["--bc"]].map(ColorInput.methods.str),
      ),
      ["--erc"]: ColorInput.methods.hexDistance(
        ColorInput.methods.str(theme.colors["--er"]),
        [theme.colors["--b1"], theme.colors["--bc"]].map(ColorInput.methods.str),
      ),
    },
  };
};
