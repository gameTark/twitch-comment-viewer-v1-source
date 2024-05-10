export const parser = {
  twitchImage: {
    parseImage: (target: string) => (props: { width: number; height: number }) => {
      return target
        .replace("{width}", props.width.toString())
        .replace("{height}", props.height.toString());
    },
  },
  createImageSrcSet: (
    props: {
      type: "width" | "ratio";
      size: number;
      src: string;
    }[],
  ) => {
    return props
      .map((val) => {
        const postfix = val.type === "ratio" ? `${val.size}x` : `${val.size}w`;
        return `${val.src} ${postfix}`;
      })
      .join(", ");
  },
};
