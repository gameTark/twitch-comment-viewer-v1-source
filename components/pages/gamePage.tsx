"use client";

import React, { useMemo } from "react";
import clsx from "clsx";
import { useLiveQuery } from "dexie-react-hooks";
import Fuse from "fuse.js";

import { db } from "@resource/db";
import { useGameContext } from "@contexts/twitch/gameContext";
import { useAsyncMemo, useInput } from "@libs/uses";

import { BroadcastInformation, BroadcastViewer } from "@components/twitch/Broadcast";
import { Broadcast } from "@components/twitch/withContext/Broadcast";
import { Game } from "@components/twitch/withContext/Game";
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

  return (
    <div className="flex flex-col h-full grow w-full">
      <div className="flex w-full justify-center mx-auto py-3 border-b">
        <div className="grow flex justify-end items-center px-7 gap-3">
          <button className="btn btn-outline btn-success btn-xs">過去の配信から追加</button>
          <button className="btn btn-outline btn-success btn-xs">新規追加</button>
        </div>
        <div className="w-2/4">
          <Search />
        </div>
        <div className="grow flex justify-end items-center px-7 gap-3">
          <button className="btn btn-outline btn-success btn-xs">過去の配信から追加</button>
          <button className="btn btn-outline btn-success btn-xs">新規追加</button>
        </div>
      </div>
      <div className="flex grow perfect-scrollbar z-0" ref={scroll.ref}>
        <BroadcastInformation />
      </div>
    </div>
  );
}

const Search = () => {
  const [input, onChange] = useInput("");
  const scroll2 = usePerfectScrollbar([]);
  const data = useSearchBroadcastTemplate(input);
  return (
    <div
      className={clsx("flex items-center dropdown dropdown-bottom dropdown-hover w-full ", {
        "[&>input]:hover:rounded-b-none": !(data == null || data.length == 0),
      })}>
      <input
        className={clsx(
          "input input-bordered input-sm input-ghost grow bg-base-100 text-base-content",
          {
            "focus:rounded-b-none": !(data == null || data.length == 0),
          },
        )}
        value={input}
        onChange={onChange}
        placeholder="検索"
      />

      <div
        className={clsx(
          "dropdown-content z-10 bg-base-100 shadow-2xl w-full h-max max-h-96 perfect-scrollbar border-x",
          { "border-b": !(data == null || data.length == 0) },
        )}
        ref={scroll2.ref}>
        {data == null || data.length == 0 ? null : (
          <ul className="flex flex-wrap gap-2 flex-col p-2">
            {data?.map((val) => (
              <li
                key={val.id}
                className="flex gap-2 items-center cursor-pointer px-5 py-4 hover:bg-base-200 rounded-box">
                <Broadcast.Provider data={val}>
                  <Broadcast.ApplyGameProvider Provider={Game.Provider}>
                    <div>
                      <Game.Image width={60} className=" rounded-box aspect-square object-cover" />
                    </div>
                    <div className="flex flex-col grow">
                      <Game.Name className="text-md font-extralight" />
                      <Broadcast.Title className="text-lg" />
                    </div>
                    <div>
                      <Broadcast.TagBadge />
                    </div>
                  </Broadcast.ApplyGameProvider>
                </Broadcast.Provider>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
