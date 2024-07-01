import { ChattersShema } from "@schemas/twitch/Parameters";

import { db } from "@resource/db";
import { TwitchAPI } from "@libs/twitch";

import { updateUserData } from "./getUserData";

export const updateChatters = async () => {
  const userData = await updateUserData();
  if (userData == null) return;

  const [users, dbData] = await Promise.all([
    TwitchAPI.chat_chatters_get({
      parameters: {
        broadcaster_id: userData.id,
        moderator_id: userData.id,
      },
    }),
    db.getChatters(),
  ] as const);

  const data = await db.spam.bulkGet(users.data.map((val) => val.user_login)).then((res) => {
    return res.map((val) => val?.login);
  });

  const chatters = users.data
    .sort((a, b) => Number(a.user_id) - Number(b.user_id))
    .filter((val) => !data.includes(val.user_login));

  const needsUpdate =
    chatters.length !== dbData.users.length ||
    chatters.filter((val) => !dbData.users.includes(val.user_id)).length !== 0 ||
    dbData.users.filter((val) => !chatters.map((val) => val.user_id).includes(val)).length !== 0;

  if (!needsUpdate) return;

  db.parameters.put(
    ChattersShema.parse({
      type: "chatters",
      value: {
        users: chatters.map((val) => val.user_id),
        total: chatters.length,
      },
    }),
  );
};
