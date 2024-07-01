import { createIsSocketType } from "./base";

export interface PointsCustomRewardRedemptionAdd {
  metadata: Metadata;
  payload: Payload;
}

export const isPointsCustomRewadedRedemptionAdd = createIsSocketType(
  "notification",
  "channel.channel_points_custom_reward_redemption.add",
);

interface Metadata {
  message_id: string;
  message_type: "notification";
  message_timestamp: string;
  subscription_type: "channel.channel_points_custom_reward_redemption.add";
  subscription_version: string;
}

interface Payload {
  subscription: Subscription;
  event: Event;
}

interface Subscription {
  id: string;
  status: string;
  type: "channel.channel_points_custom_reward_redemption.add";
  version: string;
  condition: Condition;
  transport: Transport;
  created_at: string;
  cost: number;
}

interface Condition {
  broadcaster_user_id: string;
  reward_id: string;
}

interface Transport {
  method: string;
  session_id: string;
}

interface Event {
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  user_input: string;
  status: string;
  redeemed_at: string;
  reward: Reward;
}

interface Reward {
  id: string;
  title: string;
  prompt: string;
  cost: number;
}
