"use client";

import { useState } from "react";

import { ChatList } from "@components/twitch/Chats";
import { ChatUsers } from "@components/twitch/Chatters";
import { FollowerTable } from "@components/twitch/followers";
import { LiveWatchUsers } from "@components/twitch/liveWatchUsers";

export const BroadcastContent = () => {
  const [state, setState] = useState("viewewr");
  return (
    <div className="flex flex-col gap-2 h-full py-2">
      <div className="h-fit px-2">
        <div className="flex stats shadow mt-2">
          <ChatUsers type="stat" />
          <LiveWatchUsers />
        </div>
      </div>
      <div className="h-96 grow px-2">
        <div className="flex w-full h-full gap-2">
          <div className="flex flex-col w-44">
            <p className="whitespace-nowrap px-4 py-2 font-black text-xs bg-base-300 text-base-content dasy-rounded">
              チャットユーザ一覧
            </p>
            <ChatUsers type="list" />
          </div>
          <div className="flex flex-col w-5/12">
            <p className="whitespace-nowrap px-4 py-2 font-black text-xs bg-base-300 text-base-content dasy-rounded">
              フォロワ一覧
            </p>
            <FollowerTable />
          </div>
          <div className="flex flex-col w-5/12 grow">
            <div className="whitespace-nowrap px-4 py-2 font-black text-xs bg-base-300 text-base-content dasy-rounded flex gap-5 items-center justify-between">
              コメント一覧
              <div className="flex gap-2 items-center select-none">
                <span>表示タイプ</span>
                <select
                  value={state}
                  className=" cursor-pointer select select-xs select-bordered"
                  onChange={(e) => setState(e.currentTarget.value)}>
                  <option value="viewewr">Line風</option>
                  <option value="mini">小さめ</option>
                  <option value="flat">最小限</option>
                </select>
              </div>
            </div>
            <ChatList type={state} query={{ type: "timestamp", limit: 500 }} />
          </div>
        </div>
      </div>
    </div>
  );
};
