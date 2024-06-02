"use client";

import { ChangeTheme, ThemeEditor } from "@components/commons/Theme";

export const SettingsPage = () => {
  return (
    <div className="px-4 py-2 h-full flex flex-col">
      <div className="flex gap-4 items-center h-0 grow">
        <ThemeEditor />
      </div>
    </div>
  );
};
