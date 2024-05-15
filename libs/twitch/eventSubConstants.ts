export const createType = (sessionId: string) => {
  const transport = {
    method: "websocket",
    session_id: sessionId,
  };
  return {
    stream: {
      online: (broadcasterUserId: string) => ({
        type: "stream.online",
        version: "1",
        condition: {
          broadcaster_user_id: broadcasterUserId,
        },
        transport,
      }),
      ofline: (broadcasterUserId: string) => ({
        type: "stream.offline",
        version: "1",
        condition: {
          broadcaster_user_id: broadcasterUserId,
        },
        transport,
      }),
    },
    channel: {
      update: (broadcasterUserId: string) => ({
        type: "channel.update",
        version: "2",
        condition: {
          broadcaster_user_id: broadcasterUserId,
        },
        transport,
      }),
      chat: {
        // https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/
        message: (broadcasterUserId: string, userId: string) => ({
          type: "channel.chat.message",
          version: "1",
          condition: {
            broadcaster_user_id: broadcasterUserId,
            user_id: userId,
          },
          transport,
        }),
        // https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/
        notification: (broadcasterUserId: string, userId: string) => ({
          type: "channel.chat.notification",
          version: "1",
          condition: {
            broadcaster_user_id: broadcasterUserId,
            user_id: userId,
          },
          transport,
        }),
      },
      channel_points_automatic_reward: {
        add: (broadcasterUserId: string) => ({
          type: "channel.channel_points_automatic_reward_redemption.add",
          version: "1",
          condition: {
            broadcaster_user_id: broadcasterUserId,
          },
          transport,
        }),
      },
      channel_points_custom_reward: {
        add: (broadcasterUserId: string) => ({
          type: "channel.channel_points_custom_reward.add",
          version: "1",
          condition: {
            broadcaster_user_id: broadcasterUserId,
          },
          transport,
        }),
      },
      points_custom_reward_redemption: {
        add: (broadcasterUserId: string, rewardId?: string) => ({
          type: "channel.channel_points_custom_reward_redemption.add",
          version: "1",
          condition: {
            broadcaster_user_id: broadcasterUserId,
            rewardId,
          },
          transport,
        }),
      },
      channel_points_automatic_reward_redemption: {
        add: (broadcasterUserId: string) => ({
          type: "channel.channel_points_automatic_reward_redemption.add",
          version: "1",
          condition: {
            broadcaster_user_id: broadcasterUserId,
          },
          transport,
        }),
      },
    },
  };
};
