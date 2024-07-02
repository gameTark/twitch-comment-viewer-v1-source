import { db } from "@resource/db";
import { TwitchAPI } from "@libs/twitch";

export const updateUserData = async () => {
  const dataMe = await db.getMe();
  if (dataMe == null) {
    const me = await TwitchAPI.users_get({
      parameters: {},
    });
    const userData = me.data[0];
    const result = {
      id: userData.id,
      login: userData.login,
    };
    await db.parameters.put({
      type: "me",
      value: result,
    });
    return result;
  }
  return dataMe;
};
