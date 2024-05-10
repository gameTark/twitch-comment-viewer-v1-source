import dayjs from "dayjs";

import { db } from "@resource/db";

const saveData = (data: unknown, name: string) => {
  const blob = new Blob([JSON.stringify(data)], { type: "json" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = name + "_" + dayjs(new Date()).format("YYYY-MM-DDTHH:mm:ss") + ".json";
  link.href = objectUrl;
  link.click();
  link.remove();
  return objectUrl;
};
export const Save = {
  Comment: async () => {
    const actions = await db.actions.toArray();
    saveData(actions, "DB_ACTIONS");
  },
  Users: async () => {
    const users = await db.users.toArray();
    saveData(users, "DB_USERS");
  },
  Followers: async () => {
    const followers = await db.followers.toArray();
    saveData(followers, "DB_FOLLOWERS");
  },
  ChannelHistories: async () => {
    const channelHistories = await db.channelHistories.toArray();
    saveData(channelHistories, "DB_CHANNEL_HISTORIES");
  },
  ListenerHistories: async () => {
    const listenerHistories = await db.listenerHistories.toArray();
    saveData(listenerHistories, "DB_CHANNEL_HISTORIES");
  },
  All: async () => {
    const actions = await db.actions.toArray();
    const users = await db.users.toArray();
    const followers = await db.followers.toArray();
    const channelHistories = await db.channelHistories.toArray();
    const listenerHistories = await db.listenerHistories.toArray();
    saveData(
      {
        actions,
        users,
        followers,
        channelHistories,
        listenerHistories,
      },
      "DB_ALL",
    );
  },
};
