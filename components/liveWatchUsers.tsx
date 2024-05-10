import { useEventSubContext } from "@contexts/twitch/eventSubContext";

import { Stat } from "./dasyui/Stat";
import { ICONS } from "./icons";

// TODO: ライブ視聴者の数とは違う旨を記述する https://daisyui.com/components/tooltip/
export const LiveWatchUsers = () => {
  const ctx = useEventSubContext();
  return (
    <Stat icon={ICONS.EYE} value={`${ctx?.live?.viewerCount || 0}人`} title="ライブ視聴者数" />
  );
};
