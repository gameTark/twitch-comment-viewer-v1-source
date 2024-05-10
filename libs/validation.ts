import * as z from "zod";

// https://zenn.dev/uttk/articles/bd264fa884e026

const url = z.string().url();

export const isUrl = (target: string) => {
  const result = url.safeParse(target);
  return result.success;
};
