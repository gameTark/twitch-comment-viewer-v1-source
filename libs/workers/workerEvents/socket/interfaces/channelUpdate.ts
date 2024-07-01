import { createIsSocketType } from "./base";

export interface ChannelUpdate {
  metadata: Metadata;
  payload: Payload;
}
export const isChannelUpdate = createIsSocketType<ChannelUpdate>(
  "notification",
  "channel.chat.update",
);

interface Metadata {
  message_id: string;
  message_type: "notification";
  message_timestamp: string;
  subscription_type: "channel.chat.update";
  subscription_version: string;
}

interface Payload {
  subscription: Subscription;
  event: Event;
}

interface Subscription {
  id: string;
  status: string;
  type: string;
  version: string;
  condition: Condition;
  transport: Transport;
  created_at: string;
  cost: number;
}

interface Condition {
  broadcaster_user_id: string;
}

interface Transport {
  method: string;
  session_id: string;
}

interface Event {
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  title: string;
  language: string;
  category_id: string;
  category_name: string;
  content_classification_labels: any[];
}
