"use client";

import React, { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Fuse from "fuse.js";

import { db } from "@resource/db";
import { useAsyncMemo } from "@libs/uses";

import { Scroll } from "@components/commons/PerfectScrollbar";
import { BroadcastInformation, Events, Search } from "@components/twitch/Broadcast";
import { Game } from "@components/twitch/withContext/Game";

export const useSearchBroadcastTemplate = (query: string) => {
  const data = useLiveQuery(async () => await db.broadcastTemplates.toArray(), []);
  const fuse = useAsyncMemo(async () => {
    if (data == null) return;
    const fuseData = await Promise.all(
      data.map(async (val, index) => {
        if (val.gameId == null) return;
        const game = await Game.dataloader.load(val.gameId);
        if (game == null) return;
        return {
          ...val,
          templateIndex: index,
          tags: val.tags.join(","),
          gameTitle: game.name,
        };
      }),
    );
    const result = new Fuse(fuseData, { keys: ["broadcastTitle", "tags", "gameTitle"] });
    return result;
  }, [data]);

  return useMemo(() => {
    if (fuse == null || data == null) return;
    const result = fuse.search(query);
    return result.map((val) => data[val.item?.templateIndex || 0]);
  }, [fuse, query, data]);
};

export default function GamePage() {
  return (
    <div className="flex flex-col h-full grow w-full">
      <div className="flex w-full justify-center mx-auto pt-6 pb-4 border-b items-center">
        <div className="w-2/12 flex"></div>
        <div className="w-6/12">
          <Search />
        </div>
        <div className="w-2/12 flex justify-end">
          <Events />
        </div>
      </div>
      <Scroll className="flex grow z-0">
        <BroadcastInformation />
      </Scroll>
    </div>
  );
}
