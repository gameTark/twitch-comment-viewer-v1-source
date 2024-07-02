import { DBAction } from "@schemas/twitch/Actions";
import { DBChannelHistory, DBChannelHistorySchema } from "@schemas/twitch/ChannelHistories";

import { db } from "@resource/db";

import { TwitchWebSocket } from "@libs/twitch/socket/baseSocket";
import { updateUserData } from "@libs/twitch/socket/events/getUserData";
import { updateChatters } from "@libs/twitch/socket/events/updateChatters";
import { updateFollowers } from "@libs/twitch/socket/events/updateFollowers";
import { updateSpamList } from "@libs/twitch/socket/events/updateSpamList";
import { updateStreams } from "@libs/twitch/socket/events/updateStreams";

const worker = self as any as SharedWorkerGlobalScope;
worker.addEventListener("connect", () => {
  console.log("connected");
});

const main = async () => {
  const userData = await updateUserData();
  const sock = new TwitchWebSocket({ userId: userData.id });
  await sock.ready;
  await sock.eventSubscription(
    "channel.channel_points_automatic_reward_redemption.add",
    "channel.channel_points_custom_reward_redemption.add",
    "channel.chat.message",
    "channel.update",
    "stream.offline",
    "stream.online",
  );

  sock.addEventListener("channel.chat.message", (ev) => {
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

  sock.addEventListener("channel.channel_points_automatic_reward_redemption.add", (data) => {
    const event = data.detail;
    const action: DBAction = {
      id: event.payload.event.id,
      userId: event.payload.event.user_id,
      channel: userData.login,
      userTitle: event.payload.event.reward.type,
      userInput: event.payload.event.user_input,
      rewardId: event.payload.event.reward.type,
      messageType: "atutomatic-reward",
      timestamp: Date.now(),
      rowdata: JSON.stringify(event),
      updateAt: new Date(),
      createdAt: new Date(),
    };
    db.actions.add(action);
  });

  sock.addEventListener("channel.channel_points_custom_reward_redemption.add", (data) => {
    const event = data.detail;
    const action: DBAction = {
      id: event.payload.event.id,
      userId: event.payload.event.user_id,
      channel: userData.login,
      userTitle: event.payload.event.reward.title,
      userInput: event.payload.event.user_input,
      rewardId: event.payload.event.reward.id,
      messageType: "reward",
      timestamp: Date.now(),
      rowdata: JSON.stringify(event),
      updateAt: new Date(),
      createdAt: new Date(),
    };
    db.actions.add(action);
  });
  sock.addEventListener("channel.update", (data) => {
    const event = data.detail;
    const channelHistory: DBChannelHistory = {
      channelId: userData.login,
      tpye: "update",
      broadcastTitle: event.payload.event.title,
      categoryId: event.payload.event.category_id,
      categoryName: event.payload.event.category_name,
      language: event.payload.event.language,
      timestamp: new Date(),
      rowdata: JSON.stringify(event),
      updateAt: new Date(),
      createdAt: new Date(),
    };
    db.channelHistories.put(DBChannelHistorySchema.parse(channelHistory));
  });

  sock.addEventListener("stream.online", updateStreams);
  sock.addEventListener("stream.offline", updateStreams);
  return () => {
    sock.close();
  };
};

main();
updateSpamList();
updateChatters();
updateStreams();
updateFollowers();

const INTERVAL_TIME = 10000;
setInterval(() => {
  updateChatters();
  updateSpamList();
  updateFollowers();
  updateStreams();
}, INTERVAL_TIME);

export default null; //TypeScript警告避け
