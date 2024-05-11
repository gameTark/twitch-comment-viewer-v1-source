"use client";

import { getGames } from "@resource/twitchWithDb";
import { createDataLoadContext } from "@contexts/LazyLoadContext";

const gameContext = createDataLoadContext({
  fetcher: getGames,
  idKey: "id",
});

export const useGameContext = gameContext.useContext;
export const GameContextProvider = gameContext.Provider;
