"use client";

import { ChangeEventHandler, useCallback, useMemo } from "react";
import { furthest } from "color-diff";
import Color from "colorjs.io";
import { FieldValues, useController, UseControllerProps } from "react-hook-form";

// TODO: テーマを初期化する場合BeforeInteractiveで行う https://qiita.com/koyadofu/items/1f65362c26b4c5d7dbf5
const toOklch = (rgb: string) => {
  const { l, c, h } = new Color(rgb).to("oklch");
  const max = 1000000;
  const v = (num: number) => {
    if (Number.isNaN(num)) return 0;
    return Math.floor(num * max) / max;
  };
  return {
    l: v(l),
    c: v(c),
    h: v(h),
  };
};
const OklchToString = (props: { l: number; c: number; h: number }) =>
  `${props.l} ${props.c} ${props.h}`;
const toHex = (color: string) => {
  const rgbToHex = (props: { r: number; g: number; b: number }) => {
    return `#${numberToHex(props.r * 255)}${numberToHex(props.g * 255)}${numberToHex(props.b * 255)}`;
  };
  const target = new Color(color).to("sRGB");
  return rgbToHex(target);
};
const numberToHex = (n: number) => {
  if (Number.isNaN(n)) return "00";
  const x = Math.round(n).toString(16);
  return x.length == 1 ? "0" + x : x;
};

const hexDistance = (colorSchema: string, colorSchemaPatterns: string[]) => {
  const toRGB = (color: string) => {
    const col = new Color(color).to("sRGB");
    return {
      R: col.r * 255,
      G: col.g * 255,
      B: col.b * 255,
    };
  };

  const base = toRGB(colorSchema);
  const patterns = colorSchemaPatterns.map(toRGB);
  const result = furthest(base, [
    ...patterns,
    {
      R: 255,
      G: 255,
      B: 255,
    },
  ]);
  const { l, c, h } = toOklch(
    `#${numberToHex(result.R)}${numberToHex(result.G)}${numberToHex(result.B)}`,
  );
  return OklchToString({ l, c, h });
};

/**
 * 0-1
 * 0-0.4
 * 0-360?
 * https://zenn.dev/yuitosato/articles/292f13816993ef
 */
const DefaultPicker = <TFieldValues extends FieldValues>(
  props: UseControllerProps<TFieldValues>,
) => {
  const { name, control, rules } = props;
  const controller = useController({
    name,
    control,
    rules,
  });
  const update = useCallback((props: { h: number; l: number; c: number }) => {
    controller.field.onChange(`${props.l} ${props.c} ${props.h}`);
    controller.field.onBlur();
  }, []);

  const defaultValue = useMemo(() => {
    const v = controller.field.value || "0 0 0";
    return toHex(`oklch(${v}/1.0)`);
  }, [controller.field.value]);
  const color: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    update(toOklch(e.currentTarget.value));
  }, []);

  return <input type="color" onChange={color} value={defaultValue} />;
};

export const ColorInput = {
  DefaultPicker,
  methods: {
    hexDistance,
    str: (value: string) => `oklch(${value}/1.0)`,
  },
};
