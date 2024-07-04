import { DBTheme } from "@schemas/twitch/Theme";

import { Storage } from "@libs/storage";

export class ThemeStorage {
  theme = new Storage<DBTheme>("THEME_STORAGE");
  currentTheme = new Storage<{
    theme: string;
  }>("CURRENT_THEME");
}
