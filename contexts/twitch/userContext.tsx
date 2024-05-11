"use client";

import { getUsers } from "@resource/twitchWithDb";
import { createDataLoadContext } from "@contexts/LazyLoadContext";

const userContext = createDataLoadContext({
  fetcher: getUsers,
  idKey: "id",
});

export const useUserContext = userContext.useContext;
export const UserContextProvider = userContext.Provider;
