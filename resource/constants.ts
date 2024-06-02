import Profile404 from "@assets/images/404Profile.png";
import None from "@assets/images/None.png";

import { is } from "@libs/is";

export const CONFIG = {
  API_KEY: "of40zatnkd1ftcaqnf92ahqznkg1vn",
  OAUTH: {
    REDIRECT_URI: is.build.production
      ? "https://gametark.github.io/twitch-comment-viewer-v1-frontend"
      : "http://localhost:3000",
    TYPE: "token",
    SCOPE:
      "user:edit clips:edit user:read:chat channel:read:redemptions analytics:read:games moderator:read:chatters moderator:read:followers channel_editor",
  },
  DEBUG: true,
};

export const MAX_TIMESTAMP = 8640000000000000;
export const MIN_TIMESTAMP = 0;
export const IMAGES = {
  PROFILE_404: {
    src: Profile404.src,
    alt: "Profile404",
  },
  NONE: {
    src: None.src,
    alt: "None",
  },
};

export interface Style {
  title: string;
  values: {
    displayName: string;
    cssVariable: string;
    defaultValue: string;
  }[];
}
export const DEFAULT_THEME = "lemonade";
