import { DBAction } from "@schemas/twitch/Actions";
import { DBChannelHistory, DBChannelHistorySchema } from "@schemas/twitch/ChannelHistories";

import { db } from "@resource/db";
import { dayjs } from "@libs/dayjs";
import { TwitchWebSocket } from "@libs/twitch/socket/baseSocket";
import { updateUserData } from "@libs/twitch/socket/events/getUserData";
import { updateChatters } from "@libs/twitch/socket/events/updateChatters";
import { updateFollowers } from "@libs/twitch/socket/events/updateFollowers";
import { updateSpamList } from "@libs/twitch/socket/events/updateSpamList";
import { updateStreams } from "@libs/twitch/socket/events/updateStreams";

const main = async () => {
  const userData = await updateUserData();
  const twitchSocket = new TwitchWebSocket({ userId: userData.id });
  await twitchSocket.ready;
  await twitchSocket.eventSubscription(
    "channel.channel_points_automatic_reward_redemption.add",
    "channel.channel_points_custom_reward_redemption.add",
    "channel.chat.message",
    "channel.update",
    "stream.offline",
    "stream.online",
  );
  twitchSocket.addEventListener("channel.chat.message", (ev) => {
    const action: DBAction = {
      id: ev.detail.payload.event.message_id,
      userId: ev.detail.payload.event.chatter_user_id,
      channel: userData.login,
      message: ev.detail.payload.event.message.text,
      messageType: "chat",
      fragments: ev.detail.payload.event.message.fragments,
      timestamp: Date.now(),
      rowdata: JSON.stringify(ev),
      updateAt: new Date(),
      createdAt: new Date(),
    };
    db.actions.add(action);
  });

  twitchSocket.addEventListener(
    "channel.channel_points_automatic_reward_redemption.add",
    (data) => {
      const action: DBAction = {
        id: data.detail.payload.event.id,
        userId: data.detail.payload.event.user_id,
        channel: userData.login,
        userTitle: data.detail.payload.event.reward.type,
        userInput: data.detail.payload.event.user_input,
        rewardId: data.detail.payload.event.reward.type,
        messageType: "atutomatic-reward",
        timestamp: Date.now(),
        rowdata: JSON.stringify(data.detail),
        updateAt: new Date(),
        createdAt: new Date(),
      };
      db.actions.add(action);
    },
  );

  twitchSocket.addEventListener("channel.channel_points_custom_reward_redemption.add", (data) => {
    const action: DBAction = {
      id: data.detail.payload.event.id,
      userId: data.detail.payload.event.user_id,
      channel: userData.login,
      userTitle: data.detail.payload.event.reward.title,
      userInput: data.detail.payload.event.user_input,
      rewardId: data.detail.payload.event.reward.id,
      messageType: "reward",
      timestamp: Date.now(),
      rowdata: JSON.stringify(data.detail),
      updateAt: new Date(),
      createdAt: new Date(),
    };
    db.actions.add(action);
  });

  twitchSocket.addEventListener("channel.update", (data) => {
    const channelHistory: DBChannelHistory = {
      channelId: userData.login,
      tpye: "update",
      broadcastTitle: data.detail.payload.event.title,
      categoryId: data.detail.payload.event.category_id,
      categoryName: data.detail.payload.event.category_name,
      language: data.detail.payload.event.language,
      timestamp: new Date(),
      rowdata: JSON.stringify(data.detail),
      updateAt: new Date(),
      createdAt: new Date(),
    };
    db.channelHistories.put(DBChannelHistorySchema.parse(channelHistory));
  });

  twitchSocket.addEventListener("stream.online", updateStreams);
  twitchSocket.addEventListener("stream.offline", updateStreams);
  return () => {
    twitchSocket.close();
  };
};

let destract: null | Promise<() => void> = null;
const worker = self as any as SharedWorkerGlobalScope;

worker.addEventListener("connect", async () => {
  if (destract != null) destract.then((res) => res());
  destract = main();
});

const intervalTime = dayjs.duration({ seconds: 10 }).asMilliseconds();
const cron = () => {
  updateSpamList();
  updateChatters();
  updateStreams();
  updateFollowers();
};

setInterval(cron, intervalTime);

export default null; //TypeScript警告避け
