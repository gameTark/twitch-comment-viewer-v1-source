import { db } from "@resource/db";
import { TwitchAPI } from "@libs/twitch";

import { updateUserData } from "./getUserData";

export const updateStreams = async () => {
  const userData = await updateUserData();
  const result = await TwitchAPI.streams_get({
    parameters: {
      user_id: [userData.id],
    },
  });
  const data = result.data[0];
  if (data == null) {
    db.parameters.put({
      type: "live",
      value: {
        isLive: false,
        startedAt: null,
        viewCount: 0,
      },
    });
    return;
  }
  db.parameters.put({
    type: "live",
    value: {
      isLive: true,
      startedAt: new Date(data.started_at),
      viewCount: data.viewer_count,
    },
  });
};
