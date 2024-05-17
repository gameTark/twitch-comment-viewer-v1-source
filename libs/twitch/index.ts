"use client";

import { TWITCH_CONSTANTS } from "@constants/twitch";
import Fuse from "fuse.js";
import queryString from "query-string";

import { isServer } from "@resource/constants";
import { db } from "@resource/db";

const { API_LIST, API_KEY } = TWITCH_CONSTANTS;

/**
 * 1分あたり30requestを超えると制限に抵触する可能性がある
 */

/**
 * ページネーションガイド
 * https://dev.twitch.tv/docs/api/guide/#pagination
 */
/**
 * schedule https://dev.twitch.tv/docs/api/reference/#get-channel-stream-schedule
 * videoの取得 https://dev.twitch.tv/docs/api/reference/#get-videos
 *    アナリティクスは公開しているビデオに関してアナライズできるようにしたほうが良さそう。
 *    アーカイブから分析できると良さそう。
 */

/**
 * other
 */
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

/**
 * fettchers
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

/**
 * コンテンツ分類（飲酒等）の注意タグを記載する
 * tips MatureGame 成人向けゲームはデータがない場合のみ記載可能
 */
interface FetchContentClassificationLabelPramas {
  locale?: string; // default:en-US "bg-BG", "cs-CZ", "da-DK", "da-DK", "de-DE", "el-GR", "en-GB", "en-US", "es-ES", "es-MX", "fi-FI", "fr-FR", "hu-HU", "it-IT", "ja-JP", "ko-KR", "nl-NL", "no-NO", "pl-PL", "pt-BT", "pt-PT", "ro-RO", "ru-RU", "sk-SK", "sv-SE", "th-TH", "tr-TR", "vi-VN", "zh-CN", "zh-TW"
}
export const fetchContentClassificationLabels = async (
  params: FetchContentClassificationLabelPramas,
) => {
  return await twitchFetch(API_LIST.CONTENT_CLASSIFICATION_LABELS, params);
};

export interface FetchSearchCategoriesProps {
  query: string; //  URI-encoded search string
  first?: number;
  after?: string;
}
export interface FetchSearchCategoriesResult {
  data: {
    id: string;
    name: string;
    box_art_url: string;
  }[];
  pagination: {
    cursor: string;
  };
}
export const fetchSearchCategories = async (params: FetchSearchCategoriesProps) => {
  const token = await getTwitchToken();
  const fetcher = baseFetch(token);
  const data = await fetcher(`${API_LIST.SEARCH.CATEGORIES.ENDPOINT}?query=${params.query}`);
  const req = (await data.json()) as FetchSearchCategoriesResult;

  // TODO: 検索精度が良くないが、煩雑になりそうなため一旦保留
  const result = new Fuse(req.data, { keys: ["name"] })
    .search(params.query)
    .map((val) => val.item.id);
  return req.data.sort((a, b) => (result.includes(a.id) ? 1 : -1));
};
export interface FetchChannelInfoProps {
  broadcaster_id: string;
}
export interface FetchChannelInfoResult {
  data: {
    broadcaster_id: string;
    broadcaster_login: string;
    broadcaster_name: string;
    broadcaster_language: string;
    game_id: string;
    game_name: string;
    title: string;
    delay: number;
    tags: string[];
    content_classification_labels: string[];
    is_branded_content: boolean;
  }[];
}
export const fetchChannelInfo = async (params: FetchChannelInfoProps) => {
  return await twitchFetch<FetchChannelInfoProps, FetchChannelInfoResult>(
    API_LIST.CHANNELS,
    params,
  );
};

// https://dev.twitch.tv/docs/api/reference/#modify-channel-information
interface FetchChannelInfoPatchProps {
  game_id?: string;
  broadcaster_language?: string;
  title?: string;
  delay?: number;
  tags?: string[];
  content_classification_labels?: string[];
  is_branded_content?: boolean;
}
export const fetchChannelInfoPatch = async (params: {
  id: FetchChannelInfoProps;
  patch: FetchChannelInfoPatchProps;
}) => {
  const { id, patch } = params;
  return await twitchFetch<FetchChannelInfoPatchProps, never>(
    {
      ENDPOINT: `${API_LIST.CHANNELS.PATCH.ENDPOINT}?broadcaster_id=${id.broadcaster_id}`,
      METHOD: API_LIST.CHANNELS.PATCH.METHOD,
    },
    patch,
  );
};

export interface FetchStreamsProps {
  user_id?: string | string[];
  user_login?: string | string[];
  game_id?: string | string[];
  type?: "all" | "live";
  language?: string; // language type
  first?: string;
  before?: string;
  after?: string;
}
export interface FetchStreamsResult {
  data: {
    id: string;
    user_id: string;
    user_login: string;
    user_name: string;
    game_id: string;
    game_name: string;
    type: string;
    title: string;
    tags: string[];
    viewer_count: number; // 視聴者数
    started_at: string; // ライブ開始時間
    language: string;
    thumbnail_url: string;
    tag_ids: any[];
    is_mature: boolean;
  }[];
  pagination: {
    cursor?: string;
  };
}
export const fetchStreams = async (params: FetchStreamsProps) => {
  return await twitchFetch<FetchStreamsProps, FetchStreamsResult>(API_LIST.STREAMS, params);
};
interface FetchContentClassificationLabelsPramas {
  id?: string | string[];
  name?: string | string[];
  igdb_id?: string | string[];
}
interface FetchContentClassificationLabelsResult {
  data: {
    id: string;
    name: string;
    box_art_url: string;
    igdb_id: string;
  }[];
}

export const fetchGame = async (params: FetchContentClassificationLabelsPramas) => {
  return await twitchFetch<
    FetchContentClassificationLabelsPramas,
    FetchContentClassificationLabelsResult
  >(API_LIST.GAMES, params);
};

// https://dev.twitch.tv/docs/api/reference/#get-game-analytics
interface GameAnalyticsParameter {
  game_id?: string;
  type?: string;
  started_at?: string; // example 2021-10-22T00:00:00Z
  ended_at?: string;
  first?: string;
  after?: string;
}
export const fetchGameAnalytics = async (params: GameAnalyticsParameter) => {
  return await twitchFetch(API_LIST.ANALYTICS.GAME, params);
};

/**
 * モデレーターかブロードキャスターである必要がある。
 */
export interface FetchChannelFollowersProps {
  user_id?: string;
  broadcaster_id: string;
  first?: string; // 20-100
  after?: string;
}
export interface FetchChannelFollowersResult {
  total: number;
  data: {
    user_id: string;
    user_name: string;
    user_login: string;
    followed_at: string;
  }[];
  pagination: {
    cursor: string;
  };
}

export const fetchChannelFollowers = async (params: FetchChannelFollowersProps) => {
  return await twitchFetch<FetchChannelFollowersProps, FetchChannelFollowersResult>(
    API_LIST.CHANNELS.FOLLOWERS,
    params,
  );
};

// チャットに参加しているユーザーの取得
export interface GetChatUsersParams {
  broadcaster_id: string; // チャットのリストを取得したいブロードキャスターの ID。
  moderator_id: string;
  first?: string;
  after?: string;
}
export interface GetChatUsersResult {
  data: {
    user_id: string;
    user_login: string;
    user_name: string;
  }[];
  pagination: any;
  total: number;
}

export const getChatUsers = async (params: GetChatUsersParams) => {
  // カウントしない人をはじきたい気持ちもある。
  return await twitchFetch<GetChatUsersParams, GetChatUsersResult>(API_LIST.CHAT.CHATTERS, params);
};

//curl -X GET 'https://api.twitch.tv/helix/chat/chatters?broadcaster_id=123456&moderator_id=654321' \
// -H 'Authorization: Bearer kpvy3cjboyptmiacwr0c19hotn5s' \
// -H 'Client-Id: hof5gwx0su6owfn0nyan9c87zr6t'
export interface GetUserResult {
  data: {
    id: string;
    login: string;
    display_name: string;
    type: string;
    broadcaster_type: string;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    created_at: string;
  }[];
  pagination?: {
    cursor?: string;
  }
}

/** 
 * 複数来る場合あるからキューイングしていっきに処理したい感じある。
*/
interface GetUserDataParamsById {
  login?: string; // ログインしている名前 game_tark
  id?: string | string[]; // データから取得できるID
}
export const fetchUsers = async (props: GetUserDataParamsById) => {
  const res = await twitchFetch<GetUserDataParamsById, GetUserResult>(API_LIST.USER, props);
  return res;
}

export const fetchByMe = async () => {
  const res = await fetchUsers({});
  return res;
}

export interface FetchScheduleByBloadcasterIdProps {
  broadcaster_id: string;
  id?: string; // The ID of the scheduled segment to return. To specify more than one segment, include the ID of each segment you want to get. For example, id=1234&id=5678. You may specify a maximum of 100 IDs.
  start_time?: string; // The UTC date and time that identifies when in the broadcaster’s schedule to start returning segments. If not specified, the request returns segments starting after the current UTC date and time. Specify the date and time in RFC3339 format (for example, 2022-09-01T00:00:00Z).
  first?: number; // The maximum number of items to return per page in the response. The minimum page size is 1 item per page and the maximum is 25 items per page. The default is 20.
  after?: string; // The cursor used to get the next page of results. The Pagination object in the response contains the cursor’s value. 
}
export const fetchScheduleByBloadcasterId = async (props: FetchScheduleByBloadcasterIdProps) => {
  await twitchFetch(API_LIST.SCHEDULE, props)
  //   curl -X GET 'https://api.twitch.tv/helix/schedule?broadcaster_id=141981764' \
  // -H 'Authorization: Bearer cfabdegwdoklmawdzdo98xt2fo512y' \
  // -H 'Client-Id: uo6dggojyb8d6soh92zknwmi5ej1q2'
}

// https://dev.twitch.tv/docs/api/reference/#get-eventsub-subscriptions
export interface CreateEventsubResult {
  data: SocketData[]
  total: number
  total_cost: number
  max_total_cost: number
}
export interface SocketData {
  id: string
  status: string
  type: string
  version: string
  condition: {
    user_id: string
  }
  created_at: string
  transport: {
    method: string
    callback: string
  }
  cost: number
}
export const createEventsub = async (params: any) => {
  const res = await twitchFetch<any, CreateEventsubResult>(API_LIST.EVENTSUB.SUBSCRIPTIONS, params);
  return res;
}

// url -X POST 'https://api.twitch.tv/helix/polls' \
// -H 'Authorization: Bearer vpx9etxs8bbii29krls1ljai1kdr' \
// -H 'Client-Id: dt4z41sa8uexdkjvt7uu9jjqm575' \
// -H 'Content-Type: application/json' \
// -d '{"broadcaster_id":"123456","title":"Streaming next Tuesday. Which time works best for you?","choices":[{"title":"9AM"},{"title":"10AM"},{"title":"7PM"},{"title":"8PM"},{"title":"9PM"}],"duration":300}'
export const createPool = async (params: {
  broadcaster_id: string;
  title: string;
  choices: { title: string }[];
  duration: number;
}) => {
  return await twitchFetch(API_LIST.POOL, params);
}

// -d '{"broadcaster_id":"123456","title":"What level will I reach today?","outcomes":[{"title":"Level 1"},{"title":"Level 2"},{"title":"Level 3"},{"title":"Level 4"}],"prediction_window":300}'

// markerの作成
// https://dev.twitch.tv/docs/api/markers/
// curl -X POST 'https://api.twitch.tv/helix/streams/markers' \
// -H 'Authorization: Bearer raayetjqpx1gfwu1h8iivy5cqfs1' \
// -H 'Client-Id: hof5gwx0su6owfs0nyan9c87zr6t' \
// -H 'Content-Type: application/json' \
// -d '{"user_id":123456}'
interface CreateMarkerParameters {
  user_id: string;
  description?: string;
}
export const createMarkers = async (params: CreateMarkerParameters) => {
  return await twitchFetch({
    ENDPOINT: 'https://api.twitch.tv/helix/streams/markers',
    METHOD: 'POST',
  }, params);
}

const baseFetch = (token: string): typeof fetch => {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Client-Id": API_KEY,
    "Content-Type": 'application/json',
  };
  return (...args: Parameters<typeof fetch>) => {
    const [input, init, ...other] = args;
    return fetch(input, {
      ...init,
      headers: {
        ...headers,
        ...(init?.headers || {}),
      }
    }, ...other);
  };
}