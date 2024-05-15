import { SocketEventNotificationMap } from "./twitch/notification";
import { valueOf } from "./types";

interface AbstractEventsubMessage<Type, Payload> {
  metadata: {
    message_id: string;
    message_type: Type;
    message_timestamp: string;
  };
  payload: Payload;
}
export interface EventsubMessageMap {
  session_welcome: AbstractEventsubMessage<
    "session_welcome",
    {
      session: {
        id: string;
        status: string;
        connected_at: string;
        keepalive_timeout_seconds: number;
        reconnect_url: any;
      };
    }
  >;
  session_keepalive: AbstractEventsubMessage<"session_keepalive", {}>;
  notification: valueOf<SocketEventNotificationMap>;
}
export interface Root {
  metadata: Metadata;
  payload: Payload;
}

export interface Metadata {
  message_id: string;
  message_type: string;
  message_timestamp: string;
}

export interface Payload {}

export interface ChannelChatMessageResult {
  subscription: Subscription;
  event: Event;
}

interface Subscription {
  id: string;
  status: string;
  type: "channel.chat.message";
  version: string;
  condition: Condition;
  transport: Transport;
  created_at: string;
  cost: number;
}

interface Condition {
  broadcaster_user_id: string;
  user_id: string;
}

interface Transport {
  method: string;
  session_id: string;
}

interface Event {
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  chatter_user_id: string;
  chatter_user_login: string;
  chatter_user_name: string;
  message_id: string;
  message: Message;
  color: string;
  badges: Badge[];
  message_type: string;
  cheer: any;
  reply: any;
  channel_points_custom_reward_id: any;
}

interface Message {
  text: string;
  fragments: Fragment[];
}

interface Fragment {
  type: string;
  text: string;
  cheermote: any;
  emote: any;
  mention: any;
}

interface Badge {
  set_id: string;
  id: string;
  info: string;
}
