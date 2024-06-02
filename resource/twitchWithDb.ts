"use client";

import { DBGame } from "@schemas/twitch/Game";
import { DBUserSchema } from "@schemas/twitch/User";
import { ManipulateType } from "dayjs";
import { IndexableType, Table } from "dexie";

import { BaseSchema, db, DbBroadcastTemplate } from "@resource/db";
import { dayjs } from "@libs/dayjs";
import { TwitchAPI } from "@libs/twitch";
import { filter } from "@libs/types";

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
    const result = await TwitchAPI.users_get({
      parameters: {
        id: ids.map((val) => val.toString()),
      },
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
    const res = await TwitchAPI.games_get({
      parameters: {
        id: ids.map((id) => id.toString()),
      },
    });
    const dbData = res.data.map((game): DBGame => {
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
