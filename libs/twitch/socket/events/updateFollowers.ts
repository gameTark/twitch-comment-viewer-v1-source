import { DBFollower } from "@schemas/twitch/Followers";

import { db } from "@resource/db";

import { filter } from "@libs/types";
import { TwitchAPI } from "@libs/twitch";

import { updateUserData } from "./getUserData";

export default null; //TypeScript警告避け

export const updateFollowers = async () => {
  const userData = await updateUserData();
  const dbData = (await db.followers.toArray()).filter((val) => val.channelId === userData.id);
  const api = TwitchAPI.fetchByAll(TwitchAPI.channels_followers_get);
  const apiData = await api({
    parameters: {
      broadcaster_id: userData.id,
      first: 100,
    },
  }).then((result) =>
    result.data.map(
      (val) =>
        ({
          channelId: userData.id,
          userId: val.user_id,
          followedAt: new Date(val.followed_at),
          updateAt: new Date(),
          createdAt: new Date(),
        }) as DBFollower,
    ),
  );

  const dbUserId = dbData.map((val) => val.userId);
  const apiUserId = apiData.map((val) => val.userId);

  // APIに存在しないユーザー（リムの場合）
  const unfollowUsers = dbData
    .filter((val) => !apiUserId.includes(val.userId))
    .map((data) => data.id)
    .filter(filter.notNull);

  // DBに存在しないユーザー（フォローの場合）
  const addedUser = apiData.filter((val) => !dbUserId.includes(val.userId));
  if (unfollowUsers.length !== 0) {
    db.followers.bulkDelete(unfollowUsers);
  }
  if (addedUser.length !== 0) {
    db.followers.bulkPut(addedUser);
  }
};
