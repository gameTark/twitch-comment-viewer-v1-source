import { TwitchAPI } from "@libs/twitch";

import { createType } from "../constants/types";
import { BaseTwitchSocketResult } from "./base";
import { ChannelChatMessage, isChannelChatMessage } from "./channelChatMessage";
import { ChannelUpdate, isChannelUpdate } from "./channelUpdate";
import {
  isPointsAutomaticRewardRedemptionAdd,
  PointsAutomaticRewardRedemptionAdd,
} from "./PointsAutomaticRewardRedemptionAddResult";
import {
  isPointsCustomRewadedRedemptionAdd,
  PointsCustomRewardRedemptionAdd,
} from "./PointsCustomRewardRedemptionAdd";
import { isSessionKeepalive, SessionKeepalive } from "./SessionKeepalive";
import { isSessionWelcome, SessionWelcome } from "./SessionWelcome";
import { isStreamOffline, StreamOffline } from "./streamOfiline";
import { isStreamOnline, StreamOnline } from "./streamOnline";

/**
 * @deprecated 下の方を使用する
 */
export interface SocketEventNotificationMap {
  "channel.chat.message": ChannelChatMessage;
  "channel.update": ChannelUpdate;
  "stream.online": StreamOnline;
  "stream.offline": StreamOffline;
  "channel.channel_points_custom_reward_redemption.update": any;
  "channel.channel_points_custom_reward_redemption.add": PointsCustomRewardRedemptionAdd;
  "channel.channel_points_automatic_reward_redemption.add": PointsAutomaticRewardRedemptionAdd;
}

export interface TwitchSocketEventmap {
  "channel.chat.message": CustomEvent<ChannelChatMessage>;
  "channel.update": CustomEvent<ChannelUpdate>;
  "stream.online": CustomEvent<StreamOnline>;
  "stream.offline": CustomEvent<StreamOffline>;
  "channel.channel_points_custom_reward_redemption.add": CustomEvent<PointsCustomRewardRedemptionAdd>;
  "channel.channel_points_automatic_reward_redemption.add": CustomEvent<PointsAutomaticRewardRedemptionAdd>;
  "session.keepalive": CustomEvent<SessionKeepalive>;
  "session.welcome": CustomEvent<SessionWelcome>;
}

export const eventMap: {
  [key in keyof TwitchSocketEventmap]: {
    is: (data: BaseTwitchSocketResult<any, any>) => boolean;
    regist: (socketId: string, userId: string) => Promise<void>;
  };
} = {
  "channel.chat.message": {
    is: isChannelChatMessage,
    regist: async (socketId, userId) => {
      await TwitchAPI.createEventsub(createType(socketId).channel.chat.message(userId, userId));
    },
  },
  "channel.update": {
    is: isChannelUpdate,
    regist: async (socketId, userId) => {
      await TwitchAPI.createEventsub(createType(socketId).channel.update(userId));
    },
  },
  "stream.online": {
    is: isStreamOnline,
    regist: async (socketId, userId) => {
      await TwitchAPI.createEventsub(createType(socketId).stream.online(userId));
    },
  },
  "stream.offline": {
    is: isStreamOffline,
    regist: async (socketId, userId) => {
      await TwitchAPI.createEventsub(createType(socketId).stream.offline(userId));
    },
  },
  "channel.channel_points_custom_reward_redemption.add": {
    is: isPointsCustomRewadedRedemptionAdd,
    regist: async (socketId, userId) => {
      await TwitchAPI.createEventsub(
        createType(socketId).channel.points_custom_reward_redemption.add(userId, userId),
      );
    },
  },
  "channel.channel_points_automatic_reward_redemption.add": {
    is: isPointsAutomaticRewardRedemptionAdd,
    regist: async (socketId, userId) => {
      await TwitchAPI.createEventsub(
        createType(socketId).channel.channel_points_automatic_reward_redemption.add(userId),
      );
    },
  },
  "session.keepalive": {
    is: isSessionKeepalive,
    regist: async () => {
      return;
    },
  },
  "session.welcome": {
    is: isSessionWelcome,
    regist: async () => {
      return;
    },
  },
};

export const calcrateEventType = (data: any): keyof TwitchSocketEventmap => {
  const value = Object.entries(eventMap).find(([_, { is }]) =>
    is(data),
  )?.[0] as keyof TwitchSocketEventmap;
  if (value == null) throw new Error(`data is not defined: ${JSON.stringify(data)}`);
  return value;
};

export const registerEventType = async (
  activeKey: keyof TwitchSocketEventmap,
  socketId: string,
  userId: string,
): Promise<void> => {
  return eventMap[activeKey].regist(socketId, userId);
};
