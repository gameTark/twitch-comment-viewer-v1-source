import { ChannelChatMessageResult } from "./channelChatMessage";
import { ChannelUpdateResult } from "./channelUpdate";
import { PointsAutomaticRewardRedemptionAddResult } from "./PointsAutomaticRewardRedemptionAddResult";
import { PointsCustomRewardRedemptionAdd } from "./PointsCustomRewardRedemptionAdd";
import { StreamOflineResult } from "./streamOfiline";
import { StreamOnlineResult } from "./streamOnline";

// https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types
export interface SocketEventNotificationMap {
  "channel.chat.message": ChannelChatMessageResult;
  "channel.update": ChannelUpdateResult;
  "stream.online": StreamOnlineResult;
  "stream.offline": StreamOflineResult;
  "channel.channel_points_custom_reward_redemption.update": any;
  "channel.channel_points_custom_reward_redemption.add": PointsCustomRewardRedemptionAdd;
  "channel.channel_points_automatic_reward_redemption.add": PointsAutomaticRewardRedemptionAddResult;
}
