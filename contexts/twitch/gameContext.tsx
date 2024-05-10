"use client";

import { createContext, ReactNode, useContext } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { DbGame } from "@resource/db";
import { getGames } from "@resource/twitchWithDb";

import { useBaseResourceLazyLoad } from "../baseLazyLoader";

/**
 * user情報を定期的に回してLazyLoadさせるためのBulk機構
 */
interface State {}
interface Event {
  fetchGameById: (id: DbGame["id"]) => Promise<DbGame | null>;
  fetchGameByIds: (id: DbGame["id"][]) => Promise<Map<DbGame["id"], DbGame>>;
  immediately: (id: DbGame["id"]) => Promise<DbGame | null>;
}

const userContext = createContext<State & Event>({
  fetchGameById: () => {
    throw new Error("error");
  },
  fetchGameByIds: () => {
    throw new Error("error");
  },
  immediately: () => {
    throw new Error("error");
  },
});

export const useGameContext = () => useContext(userContext);
export const useGetGameMap = (ids: DbGame["id"][]) => {
  const gameContext = useGameContext();
  return useLiveQuery(async () => {
    const result = await gameContext.fetchGameByIds(ids);
    return result;
  }, [ids]);
};
export const useGameGetById = (id?: DbGame["id"], options?: { immediately?: boolean }) => {
  const immediately = options?.immediately || false;
  const gameContext = useGameContext();
  return useLiveQuery(async () => {
    if (id == null) return null;
    if (immediately) return await gameContext.immediately(id);
    const result = await gameContext.fetchGameById(id);
    return result;
  }, [id]);
};

/**
 * TODO: 抽象化したら使いやすいかも
 */
export const GameContextProvider = (props: { children: ReactNode }) => {
  const lazyFetch = useBaseResourceLazyLoad({
    // TODO: 100以上の場合を想定していない。
    fetcher: getGames,
    idKey: "id",
  });
  return (
    <userContext.Provider
      value={{
        fetchGameByIds: async (userId: DbGame["id"][]) => {
          return await lazyFetch.fetchByIds(userId);
        },
        fetchGameById: async (userId) => {
          return (await lazyFetch.fetchByIds([userId])).get(userId) || null;
        },
        immediately: async (userId) => {
          const game = (await lazyFetch.immediately([userId]))[0] || null;
          return game;
        },
      }}>
      {props.children}
    </userContext.Provider>
  );
};
