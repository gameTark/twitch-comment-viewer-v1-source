const isProd = process.env.NODE_ENV == "production";
export const CONFIG = {
  API_KEY: "of40zatnkd1ftcaqnf92ahqznkg1vn",
  OAUTH: {
    REDIRECT_URI: isProd
      ? "https://gametark.github.io/twitch-comment-viewer-v1-frontend"
      : "http://localhost:3000",
    TYPE: "token",
    SCOPE:
      "user:edit clips:edit user:read:chat channel:read:redemptions analytics:read:games moderator:read:chatters moderator:read:followers channel_editor",
  },
  DEBUG: true,
};

export const isClient = typeof window === "object";
export const isServer = typeof window !== "object";

export const MAX_TIMESTAMP = 8640000000000000;
export const MIN_TIMESTAMP = 0;

export const KEYBOARD = {
  ENTER: "Enter",
  BACKSPACE: "Backspace",
};