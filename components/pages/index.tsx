"use client";

import { FollowerInfo } from "@components/followers";
import { LiveWatchUsers } from "@components/liveWatchUsers";
import { ChatList } from "@components/twitch/Chats";
import { ChatUsers } from "@components/twitch/Chatters";

export const BroadcastContent = () => {
  return (
    <div className="flex flex-col gap-2 h-full py-2">
      <div className="h-fit px-2">
        <div className="flex stats shadow mt-2">
          <ChatUsers type="stat" />
          <LiveWatchUsers />
          <FollowerInfo type="stat" />
        </div>
      </div>
      <div className="h-96 grow px-2">
        <div className="flex w-full h-full gap-2">
          <div className="flex flex-col">
            <p className="whitespace-nowrap px-4 py-2 font-black text-xs bg-base-300 text-base-content dasy-rounded">
              チャットユーザ一覧
            </p>
            <ChatUsers type="list" />
          </div>
          <div className="grow flex flex-col">
            <p className="whitespace-nowrap px-4 py-2 font-black text-xs bg-base-300 text-base-content dasy-rounded">
              フォロワ一覧
            </p>
            <FollowerInfo type="table" />
          </div>
          <div className="flex flex-col w-2/6">
            <p className="whitespace-nowrap px-4 py-2 font-black text-xs bg-base-300 text-base-content dasy-rounded">
              コメント一覧
            </p>
            <ChatList type="viewewr" query={{ type: "timestamp" }} />
          </div>
        </div>
      </div>
    </div>
  );
};
