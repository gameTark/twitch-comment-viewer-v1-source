"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { DbUser } from "@resource/db";
import { getUsers } from "@resource/twitchWithDb";

import { useBaseResourceLazyLoad } from "../baseLazyLoader";

/**
 * user情報を定期的に回してLazyLoadさせるためのBulk機構
 */

interface State {}
interface Event {
  fetchUserById: (id: DbUser["id"]) => Promise<DbUser | null>;
  fetchUserByIds: (id: DbUser["id"][]) => Promise<Map<DbUser["id"], DbUser>>;
  immediately: (id: DbUser["id"]) => Promise<DbUser | null>;
}

const userContext = createContext<State & Event>({
  fetchUserById: () => {
    throw new Error("error");
  },
  fetchUserByIds: () => {
    throw new Error("error");
  },
  immediately: () => {
    throw new Error("error");
  },
});

export const useUserContext = () => useContext(userContext);

export const useGetUserMap = (ids: DbUser["id"][]) => {
  const userContext = useUserContext();
  return useLiveQuery(async () => {
    const result = await userContext.fetchUserByIds(ids);
    return result;
  }, [ids]);
};
export const useUserGetById = (id: DbUser["id"], options?: { immediately?: boolean }) => {
  const immediately = options?.immediately || false;

  const userContext = useUserContext();
  return useLiveQuery(async () => {
    if (immediately) return await userContext.immediately(id);
    const result = await userContext.fetchUserById(id);
    return result;
  }, [id]);
};

/**
 * TODO: 抽象化したら使いやすいかも
 */
export const UserContextProvider = (props: { children: ReactNode }) => {
  const lazyFetch = useBaseResourceLazyLoad({
    // TODO: 100以上の場合を想定していない。
    fetcher: getUsers,
    idKey: "id",
  });
  return (
    <userContext.Provider
      value={{
        fetchUserByIds: async (userId: DbUser["id"][]) => {
          return await lazyFetch.fetchByIds(userId);
        },
        fetchUserById: async (userId) => {
          return (await lazyFetch.fetchByIds([userId])).get(userId) || null;
        },
        immediately: async (userId) => {
          const user = (await lazyFetch.immediately([userId]))[0] || null;
          return user;
        },
      }}>
      {props.children}
    </userContext.Provider>
  );
};
