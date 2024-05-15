import { Fragment } from "@schemas/twitch/Fragment";

export interface ChannelChatMessageResult {
  metadata: Metadata;
  payload: Payload;
}

interface Metadata {
  message_id: string;
  message_type: "notification";
  message_timestamp: string;
  subscription_type: "channel.chat.message";
  subscription_version: string;
}

interface Payload {
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

interface Badge {
  set_id: string;
  id: string;
  info: string;
}
export type ChatFragment = TextMessage | MentionMessage | EmoteMessage;

interface TextMessage {
  type: "text";
  text: string;
  cheermote: null;
  emote: null;
  mention: null;
}
interface MentionMessage {
  type: "mention";
  text: string;
  cheermote: null;
  emote: null;
  mention: Mention;
}
interface EmoteMessage {
  type: "emote";
  text: string;
  cheermote: null;
  emote: Emote;
  mention: null;
}
interface Mention {
  user_id: string;
  user_login: string;
  user_name: string;
}
interface Emote {
  id: string;
  emote_set_id: string;
  owner_id: string;
  format: string[];
}
