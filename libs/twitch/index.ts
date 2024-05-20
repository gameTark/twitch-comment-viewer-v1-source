"use client";

import { TWITCH_CONSTANTS } from "@constants/twitch";
import Fuse from "fuse.js";
import queryString from "query-string";

import { isServer } from "@resource/constants";
import { db } from "@resource/db";
import { operations, paths } from "interfaces/twitch-api.generated";
import { valueOf } from "@libs/types";

const { API_LIST, API_KEY } = TWITCH_CONSTANTS;
/**
 * classification labels
 */
type FetchContentClassificationLabels = PickupParameter<paths['/content_classification_labels']['get']>
export const fetchContentClassificationLabels = async (
  params: FetchContentClassificationLabels['parameters'],
) => {
  return await twitchFetch<FetchContentClassificationLabels['parameters'], FetchContentClassificationLabels['responses']>(API_LIST.CONTENT_CLASSIFICATION_LABELS, params);
};

/**
 * search categories
 */
type FetchSearchCategories = PickupParameter<paths['/search/categories']['get']>
export const fetchSearchCategories = async (params: FetchSearchCategories['parameters']) => {
  const token = await getTwitchToken();
  const fetcher = baseFetch(token);
  const data = await fetcher(`${API_LIST.SEARCH.CATEGORIES.ENDPOINT}?query=${params.query}`);
  const req = (await data.json()) as FetchSearchCategories['responses'];
  // TODO: 検索精度が良くないが、煩雑になりそうなため一旦保留
  const result = new Fuse(req.data, { keys: ["name"] })
    .search(params.query)
    .map((val) => val.item.id);
  return req.data.sort((a, b) => (result.includes(a.id) ? 1 : -1));
};

/**
 * channel info
 */
type FetchChannelInfo = PickupParameter<paths['/channels']['get']>
export type FetchChannelInfoResult = FetchChannelInfo['responses'];
export const fetchChannelInfo = async (params: FetchChannelInfo['parameters']) => {
  return await twitchFetch<FetchChannelInfo['parameters'], FetchChannelInfo['responses']>(
    API_LIST.CHANNELS,
    params,
  );
};

// https://dev.twitch.tv/docs/api/reference/#modify-channel-information
type FetchChannelInfoPatch = PickupParameter<paths['/channels']['patch']>
export const fetchChannelInfoPatch = async (params: {
  id: FetchChannelInfoPatch['parameters'];
  patch: FetchChannelInfoPatch['requestBody'];
}) => {
  const { id, patch } = params;
  return await twitchFetch<FetchChannelInfoPatch['requestBody'], FetchChannelInfoPatch['responses']>(
    {
      ENDPOINT: `${API_LIST.CHANNELS.PATCH.ENDPOINT}?broadcaster_id=${id.broadcaster_id}`,
      METHOD: API_LIST.CHANNELS.PATCH.METHOD,
    },
    patch,
  );
};

/**
 * streams
 */
type FetchStream = PickupParameter<paths['/streams']['get']>
export const fetchStreams = async (params: FetchStream['parameters']) => {
  return await twitchFetch<FetchStream['parameters'], FetchStream['responses']>(API_LIST.STREAMS, params);
};

/**
 * games
 */
type FetchGame = PickupParameter<paths['/games']['get']>
export const fetchGame = async (params: FetchGame['parameters']) => {
  return await twitchFetch<
    FetchGame['parameters'],
    FetchGame['responses']
  >(API_LIST.GAMES, params);
};

/**
 * game analiytics
 */
type FetchGameAnalytics = PickupParameter<paths['/analytics/games']['get']>
export const fetchGameAnalytics = async (params: FetchGameAnalytics['parameters']) => {
  return await twitchFetch<
    FetchGameAnalytics['parameters'],
    FetchGameAnalytics['responses']
  >(API_LIST.ANALYTICS.GAME, params);
};

/**
 * followers
 */
type FetchChannelFollowers = PickupParameter<paths['/channels/followers']['get']>
export const fetchChannelFollowers = async (params: FetchChannelFollowers['parameters']): Promise<FetchChannelFollowers['responses']> => {
  const result = await twitchFetch<FetchChannelFollowers['parameters'], FetchChannelFollowers['responses']>(
    API_LIST.CHANNELS.FOLLOWERS,
    params,
  );
  if (result.pagination?.cursor != null) {
    const result2 = await fetchChannelFollowers({
      ...params,
      after: result.pagination.cursor,
    });
    return {
      ...result2,
      data: [...result2.data, ...result.data],
    };
  }
  return result;
};

/**
 * chatters
 */
export const getChatUsers = async (params: Required<paths['/chat/chatters']['get']['parameters']>['query']) => {
  // カウントしない人をはじきたい気持ちもある。
  return await twitchFetch<Required<paths['/chat/chatters']['get']['parameters']>['query'], Required<paths['/chat/chatters']['get']>['responses']['200']['content']['application/json']>(API_LIST.CHAT.CHATTERS, params);
};

interface GetUserDataParamsById {
  login?: string; // ログインしている名前 game_tark
  id?: string | string[]; // データから取得できるID
}
// Required<paths['/polls']['post']>
export type GetUserResult = Required<paths['/users']['get']>['responses']['200']['content']['application/json']
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
}

/**
 * Pools
 * https://dev.twitch.tv/docs/api/reference/#get-polls
 */
type GET_POOL = PickupParameter<paths['/polls']['get']>;
type PATCH_POOL = PickupParameter<paths['/polls']['patch']>;
type POST_POOL = PickupParameter<paths['/polls']['post']>;
export const fetchPools = {
  get: async (params: GET_POOL['parameters']) => {
    return await twitchFetch<GET_POOL['parameters'], GET_POOL['responses']>({
      METHOD: 'GET',
      ENDPOINT: 'https://api.twitch.tv/helix/polls',
    }, params);
  },
  patch: async (params: PATCH_POOL['requestBody']) => {
    return await twitchFetch<PATCH_POOL['requestBody'], PATCH_POOL['responses']>({
      METHOD: 'PATCH',
      ENDPOINT: 'https://api.twitch.tv/helix/polls',
    }, params);
  },
  post: async (params: POST_POOL['requestBody']) => {
    return await twitchFetch<POST_POOL['requestBody'], POST_POOL['responses']>({
      METHOD: 'POST',
      ENDPOINT: 'https://api.twitch.tv/helix/polls',
    }, params);
  },
}

/**
 * Predictions
 * https://dev.twitch.tv/docs/api/reference/#get-predictions
 */
type GET_PREDICTIONS = PickupParameter<paths['/polls']['get']>;
type PATCH_PREDICTIONS = PickupParameter<paths['/polls']['patch']>;
type POST_PREDICTIONS = PickupParameter<paths['/polls']['post']>;
export const fetchPredictions = {
  get: async (params: GET_PREDICTIONS['parameters']) => {
    return await twitchFetch<GET_PREDICTIONS['parameters'], GET_PREDICTIONS['responses']>({
      METHOD: 'GET',
      ENDPOINT: 'https://api.twitch.tv/helix/polls',
    }, params);
  },
  patch: async (params: PATCH_PREDICTIONS['requestBody']) => {
    return await twitchFetch<PATCH_PREDICTIONS['requestBody'], PATCH_PREDICTIONS['responses']>({
      METHOD: 'PATCH',
      ENDPOINT: 'https://api.twitch.tv/helix/polls',
    }, params);
  },
  post: async (params: POST_PREDICTIONS['requestBody']) => {
    return await twitchFetch<POST_PREDICTIONS['requestBody'], POST_PREDICTIONS['responses']>({
      METHOD: 'POST',
      ENDPOINT: 'https://api.twitch.tv/helix/polls',
    }, params);
  },
}

/**
 * socket
 */
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
  const token = await getTwitchToken().catch(() => { });
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

type PickupParameter<Operations extends valueOf<operations>> = {
  parameters: Operations extends {
    parameters?: {
      query?: infer Parameter;
    }
  } ? Parameter : null;
  requestBody: Operations extends {
    requestBody?: {
      content?: {
        "application/json"?: infer Body;
      }
    },
  } ? Body : null;
  responses: Operations extends {
    responses?: {
      200?: {
        content?: {
          "application/json"?: infer Res;
        };
      }
    }
  } ? Res : null;
};