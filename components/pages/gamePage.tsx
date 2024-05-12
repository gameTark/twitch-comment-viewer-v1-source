"use client";

import React, { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Fuse from "fuse.js";

import { db } from "@resource/db";
import { useGameContext } from "@contexts/twitch/gameContext";
import { useAsyncMemo, useInput } from "@libs/uses";

import { BroadcastInformation, BroadcastViewer } from "@components/twitch/Broadcast";
import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";

export const useSearchBroadcastTemplate = (query: string) => {
  const gameContext = useGameContext();

  const data = useLiveQuery(async () => await db.broadcastTemplates.toArray(), []);
  const fuse = useAsyncMemo(async () => {
    if (data == null) return;
    const fuseData = await Promise.all(
      data.map(async (val, index) => {
        if (val.gameId == null) return;
        const game = await gameContext.fetchById(val.gameId);
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
  }, [gameContext, data]);

  return useMemo(() => {
    if (fuse == null || data == null) return;
    const result = fuse.search(query);
    return result.map((val) => data[val.item?.templateIndex || 0]);
  }, [fuse, query, data]);
};

export default function GamePage() {
  const scroll = usePerfectScrollbar([], {});

  const [input, onChange] = useInput();

  const scroll2 = usePerfectScrollbar([]);
  const data = useSearchBroadcastTemplate(input);
  return (
    <div className="flex flex-col h-full grow w-full">
      <div className="flex items-center gap-2 p-2 bg-accent text-accent-content dropdown dropdown-bottom dropdown-hover">
        <input
          className="input input-bordered input-sm input-ghost grow bg-base-100 text-base-content"
          value={input}
          onChange={onChange}
          placeholder="あいまい検索"
        />

        <div className=" dropdown-content z-10 bg-base-100 border-3 rounded-b-box shadow-2xl w-9/12 h-80 perfect-scrollbar" ref={scroll2.ref}>
          <div className="flex flex-wrap gap-2 m-5 rounded-box bg-base-100">
          {data?.map((val) => (
            <div key={val.id} className=" w-3/12">
              <BroadcastViewer {...val} />
            </div>
          ))}

          </div>
        </div>
      </div>
      <div className="flex grow perfect-scrollbar z-0" ref={scroll.ref}>
        <BroadcastInformation />
      </div>
    </div>
  );
}
