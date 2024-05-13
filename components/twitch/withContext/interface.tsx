import * as React from "react";
import clsx from "clsx";

import { dayjs } from "@libs/dayjs";

export type ContextElements = {
  Image: Omit<
    Omit<
      React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
      "src"
    >,
    "alt"
  >;
  Span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
  Input: React.DetailedHTMLProps<React.HTMLAttributes<HTMLInputElement>, HTMLInputElement>;
  Li: React.DetailedHTMLProps<React.HTMLAttributes<HTMLLIElement>, HTMLLIElement>;
  Ul: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
  Time: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTimeElement>, HTMLTimeElement> & {
    format?: string;
  };
  Form: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
  TypeTableSelection: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLTableSectionElement>,
    HTMLTableSectionElement
  >;
  TextArea: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
  Anchor: React.DetailedHTMLProps<React.HTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
};

export const createSpan = <T extends Object, K extends keyof T>(
  use: () => T | undefined | null,
  key: K[],
  defaultValues?: ContextElements["Span"],
) => {
  return (spanProps: ContextElements["Span"]) => {
    const item = use();
    if (item == null) return <span {...defaultValues} {...spanProps} />;
    const target = key.map((val) => item[val]).find((val) => val != null);
    switch (typeof target) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
        return (
          <span {...defaultValues} {...spanProps}>
            {target.toString()}
          </span>
        );
      default:
        throw new Error("");
    }
  };
};
export const createTime = <T extends Object, K extends keyof T>(
  use: () => T | undefined | null,
  key: K[],
  defaultValues?: ContextElements["Time"],
) => {
  return (timeProps: ContextElements["Time"]) => {
    const item = use();
    if (item == null) return <time {...defaultValues} {...timeProps} />;
    const target = key.map((val) => item[val]).find((val) => val != null);
    switch (typeof target) {
      case "number":
      case "string":
      case "object":
        if (!(target instanceof Date)) return;
        if (!dayjs.isDayjs(target)) return;

        return (
          <time {...defaultValues} {...timeProps}>
            {dayjs(target).format(timeProps.format || "YYYY/MM/DD hh:mm:ss")}
          </time>
        );
      default:
        throw new Error("");
    }
  };
};

export const createImg = <T extends Object, SrcKey extends keyof T, AltKey extends keyof T>(
  use: () => T | undefined | null,
  image: {
    src: SrcKey[];
    alt: AltKey[];
  },
  defaultImage: {
    src: string;
    alt: string;
  },
  defaultValues?: ContextElements["Image"],
) => {
  return (imageProps: ContextElements["Image"]) => {
    const item = use();
    if (item == null)
      return (
        <img
          {...defaultValues}
          {...imageProps}
          className={clsx(defaultValues?.className, imageProps.className)}
          src={defaultImage.src}
          alt={defaultImage.alt}
        />
      );
    const targetSrc = image.src.map((val) => item[val]).find((val) => val != null);
    const targetAlt = image.alt.map((val) => item[val]).find((val) => val != null);
    if (typeof targetSrc === "string" && typeof targetAlt === "string") {
      return (
        <img
          {...defaultValues}
          {...imageProps}
          className={clsx(defaultValues?.className, imageProps.className)}
          src={targetSrc}
          alt={targetAlt}
        />
      );
    }
    return (
      <img
        {...defaultValues}
        {...imageProps}
        className={clsx(defaultValues?.className, imageProps.className)}
        src={defaultImage.src}
        alt={defaultImage.alt}
      />
    );
  };
};
