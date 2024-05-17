import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@resource/db";

import { Stat } from "../dasyui/Stat";

// TODO: ライブ視聴者の数とは違う旨を記述する https://daisyui.com/components/tooltip/
export const LiveWatchUsers = () => {
  const live = useLiveQuery(() => db.getLive(), []);
  return <Stat value={`${live?.viewCount || 0}人`} title="ライブ視聴者数" />;
};
