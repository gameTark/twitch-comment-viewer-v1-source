"use client";

import { createContext, ReactNode, useContext } from "react";

import { useBaseResourceLazyLoad } from "./baseLazyLoader";

export const createDataLoadContext = <
  Result extends object,
  IdKey extends keyof Result,
  Id extends Result[IdKey],
>({
  fetcher,
  idKey,
  timeout,
  interval,
}: {
  fetcher: (ids: Id[]) => Promise<Result[]>;
  idKey: IdKey;
  interval?: number;
  timeout?: number;
}) => {
  interface State {
    state: string;
  }
  interface Event {
    fetchById: (id: Id) => Promise<Result | null>;
    fetchByIds: (ids: Id[]) => Promise<Map<Result[IdKey], Result>>;
  }

  const context = createContext<State & Event>({
    state: "",
    fetchById: () => {
      throw new Error("error");
    },
    fetchByIds: () => {
      throw new Error("error");
    },
  });

  return {
    Provider: (props: { children: ReactNode }) => {
      const loader = useBaseResourceLazyLoad<Result, IdKey, Id>({
        fetcher,
        idKey,
        timeout,
        interval,
      });

      return (
        <context.Provider
          value={{
            state: loader.state,
            fetchById: async (id) => {
              const result = await loader.fetchByIds([id]);
              return result.get(id) || null;
            },
            fetchByIds: loader.fetchByIds,
          }}>
          {props.children}
        </context.Provider>
      );
    },
    useContext: () => useContext(context),
  };
};
