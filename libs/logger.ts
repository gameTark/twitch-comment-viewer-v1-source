export const logger =
  (state: "debug" | "production") =>
  (...message: Parameters<typeof console.log>) => {
    if (state === "production") return;
    console.log(...message);
  };
