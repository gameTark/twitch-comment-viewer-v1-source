"use client";

import { useCallback, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { db, DbBroadcastTemplate, DbFollowers, DbGame, DbUser } from "@resource/db";
import { dayjs } from "@libs/dayjs";
import {
  fetchChannelFollowers,
  fetchGame,
  fetchStreams,
  fetchUsers,
  getChatUsers,
} from "@libs/twitch";
import { filter } from "@libs/types";

import { useGetComments } from "../watcher/useCommentWatcher";

export const getBroadcastTemplates = (
  props?:
    | {
        type: "id";
        value: Required<DbBroadcastTemplate>["id"][];
      }
    | {
        type: "gameId";
        value: Required<DbBroadcastTemplate>["gameId"][];
      }
    | {
        type: "tags";
        value: Required<DbBroadcastTemplate>["tags"];
      }
    | {
        type: "favorite";
        value: Required<DbBroadcastTemplate>["favorite"];
      },
) => {
  if (props === undefined) return db.broadcastTemplates.toArray();
  switch (props.type) {
    case "id":
      return db.broadcastTemplates.bulkGet(props.value);
    case "gameId":
      return db.broadcastTemplates.where("gameId").equals(props.value).toArray();
    case "tags":
      return db.broadcastTemplates.where("tags").equals(props.value).toArray();
    case "favorite":
      return db.broadcastTemplates.toArray().then((res) => {
        return res.filter((val) => Boolean(val.favorite) == props.value);
      });
  }
};
export const putBroadcastTemplate = (
  props: Omit<Omit<DbBroadcastTemplate, "updateAt">, "createdAt">,
) => {
  return db.broadcastTemplates.put({
    ...props,
    updateAt: new Date(),
    createdAt: new Date(),
  });
};
export const updateBroadcastTemplate = (
  id: Required<DbBroadcastTemplate>["id"],
  props: Partial<Omit<DbBroadcastTemplate, "id">>,
) => {
  return db.broadcastTemplates.update(id, {
    ...props,
  });
};
export const deleteBroadcastTemplate = (id: Required<DbBroadcastTemplate>["id"][]) => {
  return db.broadcastTemplates.bulkDelete(id);
};

export const getTodayFollowers = async (userId: string) => {
  const exists = await db.followers.where("channelId").equals(userId).sortBy("followedAt");
  return exists
    .reverse()
    .filter(filter.notDeleted)
    .filter((val) => val.deletedAt == null);
};

// 情報が無い場合取ってこれてない
export const useGetUserMapById = () => {
  const data = useLiveQuery(async () => {
    const result = await db.users.toArray();
    const userMap = new Map<DbUser["id"], DbUser>();
    result.forEach((val) => userMap.set(val.id, val));
    return userMap;
  }, []);
  return data;
};

export const useTwitchFollowersGetById = (channelId?: string) => {
  return useLiveQuery(async () => {
    if (channelId == null) return [];
    const exists = await db.followers.where("channelId").equals(channelId).sortBy("followedAt");
    return exists
      .reverse()
      .filter(filter.notDeleted)
      .filter((val) => val.deletedAt == null);
  }, [channelId]);
};

export const useFetchTwitcChatUsersList = () => {
  const [data, setData] = useState<DbUser["id"][]>([]);
  const update = useCallback(
    async (props: { broadcasterId?: string; userId?: string }) => {
      if (props.broadcasterId == null || props.userId == null) return;
      const users = await getChatUsers({
        broadcaster_id: props.broadcasterId,
        moderator_id: props.userId,
      });
      setData(users.data.map((val) => val.user_id));
    },
    [data],
  );

  return {
    data,
    update,
  };
};

export interface FetchStreamResult {
  isLive: boolean;
  startedAt: Date;
  viewerCount: number;
}
export const useFetchStream = () => {
  const [data, setData] = useState<FetchStreamResult | null>(null);
  const update = useCallback(async (userId: string) => {
    const result = await fetchStreams({
      user_id: userId,
    });
    const data = result.data[0];
    if (data == null) {
      setData(null);
      return;
    }
    setData({
      isLive: true,
      startedAt: new Date(data.started_at),
      viewerCount: data.viewer_count,
    });
  }, []);
  return {
    data,
    update,
  };
};

export const useTiwtchUpdateUserById = (id: string) => {
  const updateUser = useCallback(
    async (user: Partial<DbUser>) => {
      const result = await db.users.update(id, user);
      return result;
    },
    [id],
  );
  return updateUser;
};

export const useCommentCount = () => {
  const data = useGetComments({
    limit: Infinity,
  });
  return data.length;
};

const updateUser = async (id: string[]) => {
  if (id.length === 0) return [];

  // 100件ごとに分割してリクエストを作成する
  const res = await Promise.all(
    new Array(Math.ceil(id.length / 100)).fill(1).map(async (_, index) => {
      const p = index * 100;
      const n = index * 100 + 100;
      console.log(id.slice(p, n), p, n);
      return (await fetchUsers({ id: id.slice(p, n) })).data;
    }),
  );

  const result = await Promise.all(
    res.flat().map(async (targetUser) => {
      const result = {
        id: targetUser.id,
        login: targetUser.login,
        displayName: targetUser.display_name,
        type: targetUser.type,
        broadcasterType: targetUser.broadcaster_type,
        description: targetUser.description,
        profileImageUrl: targetUser.profile_image_url,
        offlineImageUrl: targetUser.offline_image_url,
        createdAt: new Date(),
        updateAt: new Date(),
        rowData: JSON.stringify(targetUser),
      };
      return result;
    }),
  );
  await db.users.bulkPut(result);
  const users = await db.users.bulkGet(id);
  return users.filter(filter.notNull);
};
export const getUsers = async (id: string[]): Promise<DbUser[]> => {
  const result = (await db.users.bulkGet(id)).filter(filter.notNull);

  // 存在しないユーザー
  const notExistsUserList = await updateUser(
    id.filter((val) => result.findIndex((r) => r.id === val) === -1),
  );

  // TODO: 更新処理を挟み込む
  return [...result, ...notExistsUserList].filter((val) => val.isSpam !== true);
};
export const getUser = async (id: string) => {
  return (await getUsers([id]))[0];
};

const updateGame = async (id: string[]) => {
  if (id.length === 0) return [];
  const res = await fetchGame({ id: id });
  const dbData = res.data.map((game): DbGame => {
    return {
      id: game.id,
      box_art_url: game.box_art_url,
      name: game.name,
      igdb_id: game.igdb_id,
      createdAt: new Date(),
      updateAt: new Date(),
    };
  });
  await db.games.bulkPut(dbData);
  const games = await db.games.bulkGet(id);
  return games.filter(filter.notNull);
};
export const getGames = async (id: DbGame["id"][]): Promise<DbGame[]> => {
  if (id.length > 100) throw new Error(`request id is 100未満 ${id.length}`);
  const result = (await db.games.bulkGet(id)).filter(filter.notNull);

  // 存在しないゲーム
  const notExistsUserList = await updateGame(
    id.filter((val) => result.findIndex((r) => r.id === val) === -1),
  );

  // TODO: 更新処理を挟み込む
  return [...result, ...notExistsUserList];
};

export const useTwitchBulkGetByUserId = (ids: string[]) => {
  const result = useLiveQuery(async () => {
    const promises = ids.map(async (id) => {
      return await getUser(id);
    });
    return Promise.all(promises);
  }, [ids]);
  const res = useMemo(() => {
    return result?.filter(filter.notNull);
  }, [result]);
  return res;
};

export const useTwitchGetByUserId = (id: string) => {
  const user = useLiveQuery(async () => {
    return await getUser(id);
  });

  return user;
};
