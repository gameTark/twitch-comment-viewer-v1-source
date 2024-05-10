import { db } from "@resource/db";

import { createType } from "../eventSubConstants";
import { EventsubMessageMap } from "../eventSubInterface";
import { SocketEventNotificationMap } from "../notification";
import { createEventsub, fetchByMe } from "../twitch";
import { EventListenerMap, valueOf } from "../types";

export default null; //TypeScript警告避け

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

      const me = await fetchByMe();
      const userData = me.data[0];
      const start = async () => {
        const id = await new Promise<string>((resolve) => {
          const fn = addListener("session_welcome", function evfn(ev) {
            removeListener(fn);
            resolve(ev.payload.session.id);
          });
        });
        const userId = userData.id;
        const typeGenerator = createType(id);
        await Promise.all([
          createEventsub(typeGenerator.channel.chat.message(userId, userId)),
          createEventsub(typeGenerator.channel.update(userId)),
          createEventsub(typeGenerator.stream.online(userId)),
          createEventsub(typeGenerator.stream.ofline(userId)),
          createEventsub(
            typeGenerator.channel.channel_points_automatic_reward_redemption.add(userId),
          ),
          createEventsub(typeGenerator.channel.channel_points_custom_reward.add(userId)),
          createEventsub(typeGenerator.channel.points_custom_reward_redemption.add(userId)),
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
