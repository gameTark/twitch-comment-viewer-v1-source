import dayjs from "dayjs";

import { db, DbFollowers } from "@resource/db";

import { createType } from "../eventSubConstants";
import { EventsubMessageMap } from "../eventSubInterface";
import { SocketEventNotificationMap } from "../notification";
import {
  createEventsub,
  fetchByMe,
  fetchChannelFollowers,
  fetchStreams,
  getChatUsers,
} from "../twitch";
import { EventListenerMap, filter, valueOf } from "../types";

export default null; //TypeScript警告避け

const INTERVAL_TIME = 10000;
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
    if (dayjs(updateAt.value).isSameOrBefore(dayjs(new Date()).add(7, "day"))) return;
  }

  const data = await fetchBotList();
  db.settings.put({
    id: DB_SPAM_SETTING,
    value: new Date().toISOString(),
  });
  db.spam.bulkPut(data.bots.map((val) => ({ login: val[0] })));
};

getSpamList();
setInterval(() => {
  getSpamList();
}, INTERVAL_TIME);
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
      value: null,
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

getStreams();
setInterval(() => {
  getStreams();
}, INTERVAL_TIME);
/* chatters */
const getChatters = async () => {
  const userData = await getUserData();
  if (userData == null) return;
  const users = await getChatUsers({
    broadcaster_id: userData.id,
    moderator_id: userData.id,
  });
  users.data.sort((a, b) => Number(a.user_id) - Number(b.user_id));
  db.parameters.put({
    type: "chatters",
    value: {
      users: users.data.map((val) => val.user_id),
      total: users.total,
    },
  });
};
getChatters();
setInterval(() => {
  getChatters();
}, INTERVAL_TIME);

/* follower */
const getTodayFollowers = async (userId: string) => {
  const exists = await db.followers.where("channelId").equals(userId).sortBy("followedAt");
  return exists
    .reverse()
    .filter(filter.notDeleted)
    .filter((val) => val.deletedAt == null);
};

const updateFollowers = async () => {
  const userData = await getUserData();
  const prevData = await getTodayFollowers(userData.id);
  const apiData = await fetchChannelFollowers({
    broadcaster_id: userData.id,
    first: "100",
  }).then((result) =>
    result.data.map(
      (val): DbFollowers => ({
        channelId: userData.id,
        userId: val.user_id,
        followedAt: new Date(val.followed_at),
        updateAt: new Date(),
        createdAt: new Date(),
      }),
    ),
  );
  const insertData = apiData
    // DBに存在しないが、APIに存在するデータは新規フォロワーとする。
    .filter((val) => {
      const item = prevData.find(
        (fVal) => fVal.userId === val.userId && fVal.channelId === val.channelId,
      );
      return item == null;
    });

  const deleteData = prevData
    // DBに存在していて、APIに存在しないフォロワーはdelete扱い
    .filter((val) => {
      const item = apiData.find(
        (fVal) => fVal.userId === val.userId && fVal.channelId === val.channelId,
      );
      return item == null;
    })
    .map((val) => ({
      ...val,
      deletedAt: new Date(),
    }));
  if (insertData.length === 0 && deleteData.length === 0) return;
  await Promise.all([db.followers.bulkAdd(insertData), db.followers.bulkPut(deleteData)]);
};

updateFollowers();
setInterval(() => {
  updateFollowers();
}, INTERVAL_TIME);

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
        db.actions.add({
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
        });
      });
      notice("channel.channel_points_automatic_reward_redemption.add", (event) => {
        db.actions.add({
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
        });
      });
      notice("channel.channel_points_custom_reward_redemption.add", (event) => {
        db.actions.add({
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
        });
      });
      notice("channel.update", (e) => {
        db.channelHistories.put({
          channelId: userData.login,
          type: "update",
          broadcastTitle: e.payload.event.title,
          categoryId: e.payload.event.category_id,
          categoryName: e.payload.event.category_name,
          language: e.payload.event.language,
          timestamp: new Date(),
          rowdata: JSON.stringify(e),
          updateAt: new Date(),
          createdAt: new Date(),
        });
      });
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

// let ports: any[] = [];
// self.addEventListener("connect", (e) => {
//     // const port = e.ports[0]
//     // if (port == null) throw new Error('port not found');
//     // ports.push(port);
//     // port.postMessage('connected port');
// });