"use client";

import { Theme } from "@components/dasyui/Theme";

export const SettingsPage = () => {
  return (
    <div className="px-4 py-2">
      <div className="flex gap-4 items-center">
        <p className="w-48 text-base">theme</p>
        <Theme />
      </div>
    </div>
  );
};
