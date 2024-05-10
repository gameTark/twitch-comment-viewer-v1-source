export interface PointsAutomaticRewardRedemptionAddResult {
  metadata: Metadata;
  payload: Payload;
}

interface Metadata {
  message_id: string;
  message_type: "notification";
  message_timestamp: string;
  subscription_type: "channel.channel_points_automatic_reward_redemption.add";
  subscription_version: string;
}

interface Payload {
  subscription: Subscription;
  event: Event;
}

interface Subscription {
  id: string;
  status: string;
  type: "channel.channel_points_automatic_reward_redemption.add";
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
  broadcaster_user_name: string;
  broadcaster_user_login: string;
  user_id: string;
  user_name: string;
  user_login: string;
  id: string;
  reward: Reward;
  message: Message;
  user_input: string;
  redeemed_at: string;
}

interface Reward {
  type: string;
  cost: number;
  unlocked_emote: any;
}

interface Message {
  text: string;
  emotes: any;
}
