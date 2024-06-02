const userAgent = () => window.navigator.userAgent.toLowerCase();
const isMac = () => userAgent().indexOf("mac os x") !== -1;
const isIOS = () => userAgent().indexOf("iphone") !== -1 || userAgent().indexOf("ipad") !== -1;
const isWindows = () => userAgent().indexOf("windows nt");
const isAndroid = () => userAgent().indexOf("android") !== -1;

const isClient = typeof window === "object";
const isServer = typeof window !== "object";
const isProd = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

export const is = {
  platform: {
    mac: isMac,
    ios: isIOS,
    windows: isWindows,
    android: isAndroid,
  },
  runner: {
    server: isServer,
    client: isClient,
  },
  build: {
    production: isProd,
    development: isDevelopment,
    test: isTest,
  },
};
