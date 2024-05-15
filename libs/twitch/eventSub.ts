import { createEventsub } from ".";
import { EventsubMessageMap } from "../eventSubInterface";
import { EventListenerMap, valueOf } from "../types";
import { createType } from "./eventSubConstants";
import { SocketEventNotificationMap } from "./notification";

/**
 * 複雑なので 手順メモ
 * 1. Websocket接続
 * 2. socket接続時になんらかのsession_idが渡される
 * 3. create eventsubのエンドポイントを触る
 *      1. セッションIDをRequest bodyに付与
 *      2. タイプを吟味した上でセッションを確立させる
 * 4. socketから色々飛んでくる。
 *
 * ping pongでセションを確立させているため、単にクローズしておけば良さそう。
 * チャットメッセージ等もこちらに格納されるみたいなので、純粋に取得したら良さそう。
 * DB設計に落とし込む必要もある。
 */

const ENDPOINT = "wss://eventsub.wss.twitch.tv/ws";

// https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/#subscription-types
const createWsEndpoint = (keepaliveTimeoutSeconds: number) => {
  if (keepaliveTimeoutSeconds <= 0)
    console.warn("keepalive timeout secondsは0以上の値である必要があります。");
  if (keepaliveTimeoutSeconds >= 600)
    console.warn("keepalive timeout secondsは600以下の値である必要があります。");
  return `${ENDPOINT}?keepalive_timeout_seconds=${keepaliveTimeoutSeconds}`;
};

/**
 * @param keepaliveTimeoutSeconds 0-600
 * @returns websocket
 */
export const createEventSubscribeSocket = (
  userId: string,
  keepaliveTimeoutSeconds: number = 20,
) => {
  // session_welcome
  const _socket = new WebSocket(createWsEndpoint(keepaliveTimeoutSeconds));

  type SocketCallback = (ev: MessageEvent) => void;
  type SocketEvent = EventListenerMap<EventsubMessageMap, SocketCallback>;

  const addListener: SocketEvent = (type, cb) => {
    const item = (ev: MessageEvent<string>) => {
      const value: valueOf<EventsubMessageMap> = JSON.parse(ev.data);
      if (type !== value.metadata.message_type) return;
      cb(value as any, ev);
    };
    _socket.addEventListener("message", item);
    return item;
  };

  const removeListener = (item: SocketCallback) => {
    _socket.removeEventListener("message", item);
  };

  type NotificationSocketEvent = EventListenerMap<SocketEventNotificationMap, SocketCallback>;
  const addNotificationListener: NotificationSocketEvent = (t, cb) => {
    const item = (ev: MessageEvent<string>) => {
      const value: valueOf<EventsubMessageMap> = JSON.parse(ev.data);
      if (value.metadata.message_type !== "notification") return;
      if (value.metadata.subscription_type !== t) return;
      cb(value as any, ev);
    };
    _socket.addEventListener("message", item);
    return item;
  };

  const notification = {
    addListener: addNotificationListener,
    removeListener,
  };

  const start = async () => {
    const id = await new Promise<string>((resolve) => {
      const fn = addListener("session_welcome", function evfn(ev) {
        removeListener(fn);
        resolve(ev.payload.session.id);
      });
    });
    const typeGenerator = createType(id);
    await Promise.all([
      createEventsub(typeGenerator.channel.chat.message(userId, userId)),
      createEventsub(typeGenerator.channel.update(userId)),
      createEventsub(typeGenerator.stream.online(userId)),
      createEventsub(typeGenerator.stream.ofline(userId)),
      createEventsub(typeGenerator.channel.channel_points_automatic_reward_redemption.add(userId)),
      createEventsub(typeGenerator.channel.channel_points_custom_reward.add(userId)),
      createEventsub(typeGenerator.channel.points_custom_reward_redemption.add(userId)),
    ]);
  };

  return {
    socket: _socket,
    close: () => {
      _socket.close();
    },
    start,
    notification,
    addListener,
    removeListener,
  };
};
