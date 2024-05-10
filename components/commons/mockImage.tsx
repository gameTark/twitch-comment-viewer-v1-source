// w450 width 450

import React, { useMemo } from "react";

type ImageProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;
type MockImageProps = Omit<Omit<ImageProps, "src">, "srcSet"> & {
  width: number;
  height: number;
};
// 2x pixcel ratio

const createUrl = (width: number, height: number) => `https://placehold.jp/${width}x${height}.png`;
export const MockImage = (props: MockImageProps) => {
  const url = createUrl(props.width, props.height);
  const srcSet = useMemo(
    () =>
      [
        createUrl(props.width, props.height),
        ...[2, 3, 4].map((val) => `${createUrl(props.width * val, props.height * val)} ${val}x`),
      ].join(", "),
    [],
  );

  return <img {...props} src={url} srcSet={srcSet} />;
};
