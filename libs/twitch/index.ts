"use client";

import { TWITCH_CONSTANTS } from "@constants/twitch";
import Fuse from "fuse.js";
import { operations, paths } from "interfaces/twitch-api.generated";
import queryString from "query-string";

import { isServer } from "@resource/constants";
import { db } from "@resource/db";
import { valueOf } from "@libs/types";

const { API_LIST, API_KEY } = TWITCH_CONSTANTS;

/**
 * TODO: Queryのkeyは直接日本語渡さないとうまく動かない
 * @deprecated できれば自動生成の方を使用する
 * Fuseの移植を考える
 */
export const fetchSearchCategories = async (
  params: PickupParameter<paths["/search/categories"]["get"]>["parameters"],
) => {
  const token = await getTwitchToken();
  const fetcher = baseFetch(token);
  const data = await fetcher(`${API_LIST.SEARCH.CATEGORIES.ENDPOINT}?query=${params.query}`);
  const req = (await data.json()) as PickupParameter<
    paths["/search/categories"]["get"]
  >["responses"];
  // TODO: 検索精度が良くないが、煩雑になりそうなため一旦保留
  return new Fuse(req.data, { keys: ["name"] }).search(params.query).map((val) => val.item);
};

/**
 * other
 */
const fetchByAll =
  <
    Parameter extends {
      parameters: {
        after?: string;
      };
    },
    Result extends {
      data: unknown[];
      pagination?: {
        cursor?: string;
      };
    },
  >(
    callback: (args: Parameter) => Promise<Result>,
  ) =>
  async (args: Parameter): Promise<Result> => {
    const main = async (args: Parameter): Promise<Result> => {
      const target = await callback(args);
      if (target.pagination?.cursor != null) {
        const result2 = await main({
          ...args,
          parameters: {
            ...args.parameters,
            after: target.pagination.cursor,
          },
        });
        return {
          ...result2,
          data: [...target.data, ...result2.data],
        };
      }
      return target;
    };
    return main(args);
  };

export const getEmoteImage = (id: string) =>
  `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/light/1.0`;

export const twitchLinks = (streamerName: string) => {
  return {
    STREAM_MANAGER: `https://dashboard.twitch.tv/u/${streamerName}/stream-manager`,
    CHANNEL: `https://www.twitch.tv/${streamerName}`,
  };
};

const STORAGE_KEY = "twitch_token";
const getTwitchToken = async () => {
  const item = await db.settings.get(STORAGE_KEY);
  if (item == null) throw new Error("twitch token is not found");
  return item.value;
};

// ログインしている状態か判断する。
export const isLoginned = async () => {
  if (isServer) return false;
  const token = await getTwitchToken().catch(() => {});
  return token != null;
};
// URLにtokenが含まれている場合ローカルストレージにセットし元のURLに戻る
export const initialTwitchToken = (props: { onSuccess: () => void }) => {
  if (isServer) return null;
  const token = getToken();
  if (token == null) return;
  db.settings
    .put({
      id: STORAGE_KEY,
      value: token,
    })
    .then(() => {
      props.onSuccess();
    });
};

const getToken = () => {
  if (isServer) return null;
  const tokens = window.location.hash.match(/access_token=(.*)&scope/); // 雑にトークンを切り出す
  if (tokens == null) return null;
  const token = tokens[1];
  return token;
};

export const hasLoginToken = () => {
  return getToken() != null;
};

export const deleteTwitchToken = async () => {
  await db.settings.delete(STORAGE_KEY);
};
export const generateTwitchOAtuhURL = ({
  clientId,
  redirectUri,
  responseType,
  scope,
}: {
  clientId: string;
  redirectUri: string;
  responseType: string;
  scope: string; // https://dev.twitch.tv/docs/authentication/scopes/
}) => {
  return `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
};

const baseFetch = (token: string): typeof fetch => {
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Client-Id": API_KEY,
    "Content-Type": "application/json",
  };
  return (...args: Parameters<typeof fetch>) => {
    const [input, init, ...other] = args;
    return fetch(
      input,
      {
        ...init,
        headers: {
          ...headers,
          ...(init?.headers || {}),
        },
      },
      ...other,
    );
  };
};

/**
 * fettchers
 * @deprecated 自動生成の方を使用する
 */
const twitchFetch = async <T extends object, Result extends unknown>(
  c: {
    METHOD: string;
    ENDPOINT: string;
  },
  params: T,
): Promise<Result> => {
  const token = await getTwitchToken();
  const fetcher = baseFetch(token);

  const validation = async (response: Response) => {
    if (!response.ok) {
      const result = await response.json();
      throw new Error(`fetch error
    ${JSON.stringify({
      status: response.status,
      endpoint: c.ENDPOINT,
      params,
      response: result,
    })}`);
    }
  };
  const getResponse = async () => {
    if (c.METHOD === "GET") {
      const response = await fetcher(`${c.ENDPOINT}?${queryString.stringify(params)}`, {
        method: c.METHOD,
      });
      return response;
    }
    const response = await fetcher(c.ENDPOINT, {
      method: c.METHOD,
      body: JSON.stringify(params),
    });
    return response;
  };

  const response = await getResponse();
  validation(response);
  const result = await response.json().catch(() => {
    return;
  });
  return result;
};

type PickupParameter<Operations extends valueOf<operations>> = {
  parameters: Operations extends {
    parameters?: {
      query?: infer Parameter;
    };
  }
    ? Parameter
    : null;
  requestBody: Operations extends {
    requestBody?: {
      content?: {
        "application/json"?: infer Body;
      };
    };
  }
    ? Body
    : null;
  responses: Operations extends {
    responses?: {
      200?: {
        content?: {
          "application/json"?: infer Res;
        };
      };
    };
  }
    ? Res
    : null;
};

type CreateRequest = <
  PathKey extends keyof paths,
  Method extends keyof paths[PathKey],
  Operation extends paths[PathKey][Method],
>(
  path: PathKey,
  method: Method,
) => (
  parameter: (Operation extends {
    requestBody?: {
      content?: {
        "application/json"?: infer Body;
      };
    };
  }
    ? { requestBody: Body }
    : {}) &
    (Operation extends {
      parameters?: {
        query?: infer Parameter;
      };
    }
      ? { parameters: Parameter }
      : {}),
) => Promise<
  Operation extends {
    responses?: {
      200?: {
        content?: {
          "application/json"?: infer Res;
        };
      };
    };
  }
    ? Res
    : null
>;

export const twitchFetcher: CreateRequest =
  (pathKey, methodName) =>
  async ({ parameters, requestBody }: any): Promise<any> => {
    const token = await getTwitchToken();
    const fetcher = baseFetch(token);
    // TODO: 日本語のqueryStringがtwitcの仕様と合わないため別の方法を考える
    const result = await fetcher(
      `https://api.twitch.tv/helix${pathKey}?${queryString.stringify(parameters || {})}`,
      {
        method: methodName.toString().toUpperCase(),
        body: requestBody == null ? undefined : JSON.stringify(requestBody),
      },
    );
    return await result.json();
  };

export const TwitchAPI = {
  fetchByAll,
  createEventsub: async (params: any) => {
    const res = await TwitchAPI.eventsub_subscriptions_post({
      requestBody: params,
    });
    return res;
  },
  channels_commercial_post: twitchFetcher("/channels/commercial", "post"),
  channels_ads_get: twitchFetcher("/channels/ads", "get"),
  channels_ads_schedule_snooze_post: twitchFetcher("/channels/ads/schedule/snooze", "post"),
  analytics_extensions_get: twitchFetcher("/analytics/extensions", "get"),
  analytics_games_get: twitchFetcher("/analytics/games", "get"),
  bits_leaderboard_get: twitchFetcher("/bits/leaderboard", "get"),
  bits_cheermotes_get: twitchFetcher("/bits/cheermotes", "get"),
  extensions_transactions_get: twitchFetcher("/extensions/transactions", "get"),
  channels_get: twitchFetcher("/channels", "get"),
  channels_patch: twitchFetcher("/channels", "patch"),
  channels_editors_get: twitchFetcher("/channels/editors", "get"),
  channels_followed_get: twitchFetcher("/channels/followed", "get"),
  channels_followers_get: twitchFetcher("/channels/followers", "get"),
  channel_points_custom_rewards_post: twitchFetcher("/channel_points/custom_rewards", "post"),
  channel_points_custom_rewards_delete: twitchFetcher("/channel_points/custom_rewards", "delete"),
  channel_points_custom_rewards_get: twitchFetcher("/channel_points/custom_rewards", "get"),
  channel_points_custom_rewards_redemptions_get: twitchFetcher(
    "/channel_points/custom_rewards/redemptions",
    "get",
  ),
  channel_points_custom_rewards_patch: twitchFetcher("/channel_points/custom_rewards", "patch"),
  channel_points_custom_rewards_redemptions_patch: twitchFetcher(
    "/channel_points/custom_rewards/redemptions",
    "patch",
  ),
  charity_campaigns_get: twitchFetcher("/charity/campaigns", "get"),
  charity_donations_get: twitchFetcher("/charity/donations", "get"),
  chat_chatters_get: twitchFetcher("/chat/chatters", "get"),
  chat_emotes_get: twitchFetcher("/chat/emotes", "get"),
  chat_emotes_global_get: twitchFetcher("/chat/emotes/global", "get"),
  chat_emotes_set_get: twitchFetcher("/chat/emotes/set", "get"),
  chat_badges_get: twitchFetcher("/chat/badges", "get"),
  chat_badges_global_get: twitchFetcher("/chat/badges/global", "get"),
  chat_settings_get: twitchFetcher("/chat/settings", "get"),
  chat_emotes_user_get: twitchFetcher("/chat/emotes/user", "get"),
  chat_settings_patch: twitchFetcher("/chat/settings", "patch"),
  chat_announcements_post: twitchFetcher("/chat/announcements", "post"),
  chat_shoutouts_post: twitchFetcher("/chat/shoutouts", "post"),
  chat_messages_post: twitchFetcher("/chat/messages", "post"),
  chat_color_get: twitchFetcher("/chat/color", "get"),
  chat_color_put: twitchFetcher("/chat/color", "put"),
  clips_post: twitchFetcher("/clips", "post"),
  clips_get: twitchFetcher("/clips", "get"),
  eventsub_conduits_get: twitchFetcher("/eventsub/conduits", "get"),
  eventsub_conduits_post: twitchFetcher("/eventsub/conduits", "post"),
  eventsub_conduits_patch: twitchFetcher("/eventsub/conduits", "patch"),
  eventsub_conduits_delete: twitchFetcher("/eventsub/conduits", "delete"),
  eventsub_conduits_shards_get: twitchFetcher("/eventsub/conduits/shards", "get"),
  eventsub_conduits_shards_patch: twitchFetcher("/eventsub/conduits/shards", "patch"),
  content_classification_labels_get: twitchFetcher("/content_classification_labels", "get"),
  entitlements_drops_get: twitchFetcher("/entitlements/drops", "get"),
  entitlements_drops_patch: twitchFetcher("/entitlements/drops", "patch"),
  extensions_configurations_get: twitchFetcher("/extensions/configurations", "get"),
  extensions_configurations_put: twitchFetcher("/extensions/configurations", "put"),
  extensions_required_configuration_put: twitchFetcher("/extensions/required_configuration", "put"),
  extensions_pubsub_post: twitchFetcher("/extensions/pubsub", "post"),
  extensions_live_get: twitchFetcher("/extensions/live", "get"),
  extensions_jwt_secrets_get: twitchFetcher("/extensions/jwt/secrets", "get"),
  extensions_jwt_secrets_post: twitchFetcher("/extensions/jwt/secrets", "post"),
  extensions_chat_post: twitchFetcher("/extensions/chat", "post"),
  extensions_get: twitchFetcher("/extensions", "get"),
  extensions_released_get: twitchFetcher("/extensions/released", "get"),
  bits_extensions_get: twitchFetcher("/bits/extensions", "get"),
  bits_extensions_put: twitchFetcher("/bits/extensions", "put"),
  eventsub_subscriptions_post: twitchFetcher("/eventsub/subscriptions", "post"),
  eventsub_subscriptions_delete: twitchFetcher("/eventsub/subscriptions", "delete"),
  eventsub_subscriptions_get: twitchFetcher("/eventsub/subscriptions", "get"),
  games_top_get: twitchFetcher("/games/top", "get"),
  games_get: twitchFetcher("/games", "get"),
  goals_get: twitchFetcher("/goals", "get"),
  guest_star_channel_settings_get: twitchFetcher("/guest_star/channel_settings", "get"),
  guest_star_channel_settings_put: twitchFetcher("/guest_star/channel_settings", "put"),
  guest_star_session_get: twitchFetcher("/guest_star/session", "get"),
  guest_star_session_post: twitchFetcher("/guest_star/session", "post"),
  guest_star_session_delete: twitchFetcher("/guest_star/session", "delete"),
  guest_star_invites_get: twitchFetcher("/guest_star/invites", "get"),
  guest_star_invites_post: twitchFetcher("/guest_star/invites", "post"),
  guest_star_invites_delete: twitchFetcher("/guest_star/invites", "delete"),
  guest_star_slot_post: twitchFetcher("/guest_star/slot", "post"),
  guest_star_slot_patch: twitchFetcher("/guest_star/slot", "patch"),
  guest_star_slot_delete: twitchFetcher("/guest_star/slot", "delete"),
  guest_star_slot_settings_patch: twitchFetcher("/guest_star/slot_settings", "patch"),
  hypetrain_events_get: twitchFetcher("/hypetrain/events", "get"),
  moderation_enforcements_status_post: twitchFetcher("/moderation/enforcements/status", "post"),
  moderation_automod_message_post: twitchFetcher("/moderation/automod/message", "post"),
  moderation_automod_settings_get: twitchFetcher("/moderation/automod/settings", "get"),
  moderation_automod_settings_put: twitchFetcher("/moderation/automod/settings", "put"),
  moderation_banned_get: twitchFetcher("/moderation/banned", "get"),
  moderation_bans_post: twitchFetcher("/moderation/bans", "post"),
  moderation_bans_delete: twitchFetcher("/moderation/bans", "delete"),
  moderation_unban_requests_get: twitchFetcher("/moderation/unban_requests", "get"),
  moderation_unban_requests_patch: twitchFetcher("/moderation/unban_requests", "patch"),
  moderation_blocked_terms_get: twitchFetcher("/moderation/blocked_terms", "get"),
  moderation_blocked_terms_post: twitchFetcher("/moderation/blocked_terms", "post"),
  moderation_blocked_terms_delete: twitchFetcher("/moderation/blocked_terms", "delete"),
  moderation_chat_delete: twitchFetcher("/moderation/chat", "delete"),
  moderation_channels_get: twitchFetcher("/moderation/channels", "get"),
  moderation_moderators_get: twitchFetcher("/moderation/moderators", "get"),
  moderation_moderators_post: twitchFetcher("/moderation/moderators", "post"),
  moderation_moderators_delete: twitchFetcher("/moderation/moderators", "delete"),
  channels_vips_get: twitchFetcher("/channels/vips", "get"),
  channels_vips_post: twitchFetcher("/channels/vips", "post"),
  channels_vips_delete: twitchFetcher("/channels/vips", "delete"),
  moderation_shield_mode_put: twitchFetcher("/moderation/shield_mode", "put"),
  moderation_shield_mode_get: twitchFetcher("/moderation/shield_mode", "get"),
  polls_get: twitchFetcher("/polls", "get"),
  polls_post: twitchFetcher("/polls", "post"),
  polls_patch: twitchFetcher("/polls", "patch"),
  predictions_get: twitchFetcher("/predictions", "get"),
  predictions_post: twitchFetcher("/predictions", "post"),
  predictions_patch: twitchFetcher("/predictions", "patch"),
  raids_post: twitchFetcher("/raids", "post"),
  raids_delete: twitchFetcher("/raids", "delete"),
  schedule_get: twitchFetcher("/schedule", "get"),
  schedule_icalendar_get: twitchFetcher("/schedule/icalendar", "get"),
  schedule_settings_patch: twitchFetcher("/schedule/settings", "patch"),
  schedule_segment_post: twitchFetcher("/schedule/segment", "post"),
  schedule_segment_patch: twitchFetcher("/schedule/segment", "patch"),
  schedule_segment_delete: twitchFetcher("/schedule/segment", "delete"),
  search_categories_get: twitchFetcher("/search/categories", "get"),
  search_channels_get: twitchFetcher("/search/channels", "get"),
  streams_get: twitchFetcher("/streams", "get"),
  streams_followed_get: twitchFetcher("/streams/followed", "get"),
  streams_markers_post: twitchFetcher("/streams/markers", "post"),
  streams_markers_get: twitchFetcher("/streams/markers", "get"),
  subscriptions_get: twitchFetcher("/subscriptions", "get"),
  subscriptions_user_get: twitchFetcher("/subscriptions/user", "get"),
  tags_streams_get: twitchFetcher("/tags/streams", "get"),
  streams_tags_get: twitchFetcher("/streams/tags", "get"),
  teams_channel_get: twitchFetcher("/teams/channel", "get"),
  teams_get: twitchFetcher("/teams", "get"),
  users_get: twitchFetcher("/users", "get"),
  users_put: twitchFetcher("/users", "put"),
  users_blocks_get: twitchFetcher("/users/blocks", "get"),
  users_blocks_put: twitchFetcher("/users/blocks", "put"),
  users_blocks_delete: twitchFetcher("/users/blocks", "delete"),
  users_extensions_list_get: twitchFetcher("/users/extensions/list", "get"),
  users_extensions_get: twitchFetcher("/users/extensions", "get"),
  users_extensions_put: twitchFetcher("/users/extensions", "put"),
  videos_get: twitchFetcher("/videos", "get"),
  videos_delete: twitchFetcher("/videos", "delete"),
  whispers_post: twitchFetcher("/whispers", "post"),
};