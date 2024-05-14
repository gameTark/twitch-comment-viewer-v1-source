"use client";

import { useCallback, useMemo } from "react";
import { DBUser, DBUserSchema } from "@schemas/twitch/User";
import { ManipulateType } from "dayjs";
import { IndexableType, Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import Fuse from "fuse.js";

import { BaseSchema, db, DbBroadcastTemplate, DbGame } from "@resource/db";
import { dayjs } from "@libs/dayjs";
import { fetchGame, fetchUsers } from "@libs/twitch";
import { filter } from "@libs/types";
import { useAsyncMemo } from "@libs/uses";

const createPatchDatabase =
  <T extends BaseSchema, Id extends IndexableType>(props: {
    table: Table<T>;
    idKey: keyof T;
    fetcher: (ids: Id[]) => Promise<T[]>;
    options?: {
      updateTiming?: { value: number; unit?: ManipulateType };
    };
  }) =>
  async (ids: Id[]): Promise<T[]> => {
    const results = (await props.table.bulkGet(ids)).filter(filter.notNull).filter((value) => {
      if (props.options?.updateTiming != null) {
        return dayjs(value.updateAt).isSameOrBefore(
          dayjs(new Date()).add(props.options.updateTiming.value, props.options.updateTiming.unit),
        );
      }
      return true;
    });
    const notExistsIdList = ids.filter((val) => {
      return (
        results.findIndex((result) => {
          return result[props.idKey] === val;
        }) === -1
      );
    });
    const notExistsUserList = await props.fetcher(notExistsIdList);
    await props.table.bulkPut(notExistsUserList);

    return (await props.table.bulkGet(ids)).filter(filter.notNull);
  };

const _createFetcher =
  <T extends object, Id extends IndexableType>(fetcher: (id: Id[]) => Promise<T[]>) =>
  async (id: Id[]): Promise<T[]> => {
    if (id.length === 0) return [];
    const res = await Promise.all(
      new Array(Math.ceil(id.length / 100)).fill(1).map(async (_, index) => {
        const p = index * 100;
        const n = index * 100 + 100;
        return await fetcher(id.slice(p, n));
      }),
    );
    return res.flat();
  };

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

export const getFollowers = async (userId: string) => {
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
    const userMap = new Map<DBUser["id"], DBUser>();
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

export const useTiwtchUpdateUserById = (id?: string) => {
  const updateUser = useCallback(
    async (user: Partial<DBUser>) => {
      if (id == null) return;
      const result = await db.users.update(id, user);
      return result;
    },
    [id],
  );
  return updateUser;
};

export const useSpamCheck = (login?: string) => {
  const isSpam = useAsyncMemo(async () => {
    if (login == null) return;
    const spam = await db.spam.get(login);
    return spam != null;
  }, [login]);
  return isSpam;
};

/*
==========================================================================
                          Broadcast Template
==========================================================================
 */

export const updateBroadcastTemplate = (
  id: Required<DbBroadcastTemplate>["id"],
  props: Partial<Omit<DbBroadcastTemplate, "id">>,
) => {
  return db.broadcastTemplates.update(id, {
    ...props,
    updateAt: new Date(),
  });
};
export const deleteBroadcastTemplate = (id: Required<DbBroadcastTemplate>["id"][]) => {
  return db.broadcastTemplates.bulkDelete(id);
};

/*
==========================================================================
                          User
==========================================================================
 */
export const getUsers = createPatchDatabase({
  table: db.users,
  idKey: "id",
  options: {
    updateTiming: {
      value: 1,
      unit: "day",
    },
  },
  fetcher: _createFetcher(async (ids) => {
    const result = await fetchUsers({
      id: ids.map((val) => val.toString()),
    });
    const spam = await db.spam.bulkGet(result.data.map((val) => val.login));
    return result.data.map((val) => {
      return DBUserSchema.parse({
        id: val.id,
        login: val.login,
        displayName: val.display_name,
        type: val.type,
        broadcasterType: val.broadcaster_type,
        description: val.description,
        profileImageUrl: val.profile_image_url,
        offlineImageUrl: val.offline_image_url,
        createdAt: new Date(),
        updateAt: new Date(),
        isSpam: spam.findIndex((v) => v?.login === val.login) !== -1,
        rowData: JSON.stringify(val),
      });
    });
  }),
});

/*
==========================================================================
                          Game
==========================================================================
 */
export const getGames = createPatchDatabase({
  table: db.games,
  idKey: "id",
  fetcher: _createFetcher(async (ids) => {
    const res = await fetchGame({ id: ids.map((id) => id.toString()) });
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
    return dbData;
  }),
});
