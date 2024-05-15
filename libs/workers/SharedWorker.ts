import { DBAction } from "@schemas/twitch/Actions";
import { DBChannelHistory, DBChannelHistorySchema } from "@schemas/twitch/ChannelHistories";
import { DBFollower } from "@schemas/twitch/Followers";
import { ChattersShema } from "@schemas/twitch/Parameters";

import { db } from "@resource/db";
import { isTargetDateAgo } from "@libs/utils";

import { EventsubMessageMap } from "../eventSubInterface";
import {
  createEventsub,
  fetchByMe,
  fetchChannelFollowers,
  fetchStreams,
  getChatUsers,
} from "../twitch";
import { createType } from "../twitch/eventSubConstants";
import { SocketEventNotificationMap } from "../twitch/notification";
import { EventListenerMap, filter, valueOf } from "../types";

export default null; //TypeScript警告避け

/**
 * 起動しっぱなしの場合、バグ出た時ちょっと厄介
 */

const getUserData = async () => {
  const dataMe = await db.getMe();
  if (dataMe == null) {
    const me = await fetchByMe();
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
/* bots */
const fetchBotList = async () => {
  interface Bot {
    bots: [string, number, number][];
    _total: number;
  }
  try {
    const res = await fetch("https://api.twitchinsights.net/v1/bots/all", {
      method: "GET",
    });
    const value = await res.json();
    return value as Bot;
  } catch {
    return {
      bots: [],
      _total: 0,
    };
  }
};
const DB_SPAM_SETTING = "SPAM_UPDATED_AT";
const getSpamList = async () => {
  const updateAt = await db.settings.get(DB_SPAM_SETTING);
  if (updateAt?.value != null) {
    // 今日より7日後より前の場合は更新しない
    const isPast = isTargetDateAgo({
      target: updateAt.value,
      num: 7,
      ago: "day",
    });
    if (!isPast) return;
  }

  const data = await fetchBotList();
  db.settings.put({
    id: DB_SPAM_SETTING,
    value: new Date().toISOString(),
  });
  db.spam.bulkPut(data.bots.map((val) => ({ login: val[0] })));
};

/* streams */
const getStreams = async () => {
  const userData = await getUserData();
  const result = await fetchStreams({
    user_id: userData.id,
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

/* chatters */
const getChatters = async () => {
  const userData = await getUserData();
  if (userData == null) return;

  const [users, dbData] = await Promise.all([
    getChatUsers({
      broadcaster_id: userData.id,
      moderator_id: userData.id,
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

/* follower */
const updateFollowers = async () => {
  const userData = await getUserData();
  const dbData = (await db.followers.toArray()).filter((val) => val.channelId === userData.id);
  const apiData = await fetchChannelFollowers({
    broadcaster_id: userData.id,
    first: "100",
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

/* web socket */

const ENDPOINT = "wss://eventsub.wss.twitch.tv/ws";
const createWsEndpoint = (keepaliveTimeoutSeconds: number) => {
  if (keepaliveTimeoutSeconds <= 0)
    console.warn("keepalive timeout secondsは0以上の値である必要があります。");
  if (keepaliveTimeoutSeconds >= 600)
    console.warn("keepalive timeout secondsは600以下の値である必要があります。");
  return `${ENDPOINT}?keepalive_timeout_seconds=${keepaliveTimeoutSeconds}`;
};
type SocketCallback = (ev: MessageEvent) => void;
type SocketEvent = EventListenerMap<EventsubMessageMap, SocketCallback>;
type NotificationSocketEvent = EventListenerMap<SocketEventNotificationMap, SocketCallback>;

const createAddListener =
  (socket: WebSocket): SocketEvent =>
  (type, cb) => {
    const item = (ev: MessageEvent<string>) => {
      const value: valueOf<EventsubMessageMap> = JSON.parse(ev.data);
      if (type !== value.metadata.message_type) return;
      cb(value as any, ev);
    };
    socket.addEventListener("message", item);
    return item;
  };

const createRemoveListener = (socket: WebSocket) => (item: SocketCallback) => {
  socket.removeEventListener("message", item);
};

const createAddNotificationListener =
  (socket: WebSocket): NotificationSocketEvent =>
  (t, cb) => {
    const item = (ev: MessageEvent<string>) => {
      const value: valueOf<EventsubMessageMap> = JSON.parse(ev.data);
      if (value.metadata.message_type !== "notification") return;
      if (value.metadata.subscription_type !== t) return;
      cb(value as any, ev);
    };
    socket.addEventListener("message", item);
    return item;
  };

const createSocket = () => {
  let socketInstance: WebSocket | null = null;
  return {
    connect: async () => {
      const socket = new WebSocket(createWsEndpoint(30));
      const notice = createAddNotificationListener(socket);
      const addListener = createAddListener(socket);
      const removeListener = createRemoveListener(socket);
      socketInstance = socket;

      const userData = await getUserData();
      const start = async () => {
        const id = await new Promise<string>((resolve) => {
          const fn = addListener("session_welcome", function evfn(ev) {
            removeListener(fn);
            resolve(ev.payload.session.id);
          });
        });
        const userId = userData;
        const typeGenerator = createType(id);
        await Promise.all([
          createEventsub(typeGenerator.channel.chat.message(userId.id, userId.id)),
          createEventsub(typeGenerator.channel.update(userId.id)),
          createEventsub(typeGenerator.stream.online(userId.id)),
          createEventsub(typeGenerator.stream.ofline(userId.id)),
          createEventsub(
            typeGenerator.channel.channel_points_automatic_reward_redemption.add(userId.id),
          ),
          createEventsub(typeGenerator.channel.channel_points_custom_reward.add(userId.id)),
          createEventsub(typeGenerator.channel.points_custom_reward_redemption.add(userId.id)),
        ]);
      };
      start();
      socket.addEventListener("message", (ev) => {
        console.log(JSON.parse(ev.data));
      });

      notice("channel.chat.message", (event) => {
        const action: DBAction = {
          id: event.payload.event.message_id,
          userId: event.payload.event.chatter_user_id,
          channel: userData.login,
          message: event.payload.event.message.text,
          messageType: "chat",
          fragments: event.payload.event.message.fragments,
          timestamp: Date.now(),
          rowdata: JSON.stringify(event),
          updateAt: new Date(),
          createdAt: new Date(),
        };
        db.actions.add(action);
      });
      notice("channel.channel_points_automatic_reward_redemption.add", (event) => {
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
      notice("channel.channel_points_custom_reward_redemption.add", (event) => {
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

      notice("channel.update", (e) => {
        const channelHistory: DBChannelHistory = {
          channelId: userData.login,
          tpye: "update",
          broadcastTitle: e.payload.event.title,
          categoryId: e.payload.event.category_id,
          categoryName: e.payload.event.category_name,
          language: e.payload.event.language,
          timestamp: new Date(),
          rowdata: JSON.stringify(e),
          updateAt: new Date(),
          createdAt: new Date(),
        };
        db.channelHistories.put(DBChannelHistorySchema.parse(channelHistory));
      });

      notice("stream.offline", () => getStreams());
      notice("stream.online", () => getStreams());
    },

    close: () => {
      if (socketInstance == null) return;
      socketInstance.close();
      socketInstance = null;
    },
  };
};

const socket = createSocket();
socket.connect();

const INTERVAL_TIME = 10000;
getChatters();
getSpamList();
updateFollowers();
getStreams();
setInterval(() => {
  getChatters();
  getSpamList();
  updateFollowers();
  getStreams();
}, INTERVAL_TIME);