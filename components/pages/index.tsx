"use client";

import { useCallback, useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import clsx from "clsx";

import { useDialog } from "@components/commons/Dialog";
import { Scroll } from "@components/commons/PerfectScrollbar";
import BroadcastEditor, { FaboriteBroadcastItemList } from "@components/twitch/Broadcast";
import { ChatList } from "@components/twitch/Chats";
import { ChatUsers } from "@components/twitch/Chatters";
import { FollowerStat, FollowerTable } from "@components/twitch/followers";
import { LiveWatchUsers } from "@components/twitch/liveWatchUsers";
import { useBroadcastInformationPatch, useBroadcastInformationQuery } from "@uses/queries";
import { useInterval } from "@uses/useInterval";

const Stat = () => {
  return (
    <div className="flex stats">
      <ChatUsers type="stat" />
      <LiveWatchUsers />
      <FollowerStat />
    </div>
  );
};

const Chat = () => {
  return (
    <div className="h-full flex flex-col">
      <p className="whitespace-nowrap px-4 py-2 font-black text-xs bg-base-300 text-base-content dasy-rounded text-center">
        チャットユーザ一覧
      </p>
      <ChatUsers type="list" />
    </div>
  );
};
const CurrentBroadcastEdit = () => {
  const query = useBroadcastInformationQuery();
  const patch = useBroadcastInformationPatch();
  const dialog = useDialog();
  // TODO: Contextに置き換える
  const handleCommit = useCallback(
    (...args: Parameters<typeof patch>) => {
      dialog.open({
        title: "配信に適用しますか？",
        onSuccess: async () => {
          await patch(...args);
          query.refetch();
          dialog.open({
            title: "適用完了",
            successText: "OK",
            nofail: true,
          });
        },
      });
    },
    [query, patch],
  );

  useInterval(
    () => {
      if (!query.isSuccess) return;
      query.refetch();
    },
    {
      deps: [],
      interval: 1000,
    },
  );
  if (!query.isSuccess) return <></>;
  return <BroadcastEditor value={query.data} onCommit={handleCommit} />;
};

const Tabs = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <TabGroup
      className="flex flex-col h-full gap-4"
      selectedIndex={selectedIndex}
      onChange={setSelectedIndex}>
      <TabList className=" grow-0 tablist tabs-bordered w-full select-none">
        <Tab as="a" className={(btn) => clsx("tab", { ["tab-active"]: btn.selected })}>
          フォロワ一覧
        </Tab>
        <Tab as="a" className={(btn) => clsx("tab", { ["tab-active"]: btn.selected })}>
          配信編集
        </Tab>
        <Tab as="a" className={(btn) => clsx("tab", { ["tab-active"]: btn.selected })}>
          配信テンプレート
        </Tab>
      </TabList>
      <TabPanels className="relative grow overflow-hidden">
        <TabPanel className="flex w-full h-full">
          <FollowerTable />
        </TabPanel>
        <TabPanel className="flex w-full h-full">
          <CurrentBroadcastEdit />
        </TabPanel>
        <TabPanel className="flex w-full h-full">
          <Scroll>
            <FaboriteBroadcastItemList />
          </Scroll>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
};
const Comments = () => {
  const [state, setState] = useState("viewewr");

  return (
    <div className="h-full flex flex-col">
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
  );
};

export const BroadcastContent = () => {
  return (
    <div className="grid grid-rows-[max-content_minmax(0,1fr)] grid-cols-[200px_repeat(4,_minmax(0,_1fr))] h-full gap-4 p-2">
      <div className="col-span-5 row-span-1">
        <Stat />
      </div>
      {/*
        <div>
          hoge
          <iframe src="https://dashboard.twitch.tv/popout/u/game_tark/stream-manager/edit-stream-info" referrerPolicy="no-referrer" />
        </div> 
      */}

      <div className="row-start-2 col-span-1">
        <Chat />
      </div>

      <div className="row-start-2 col-start-2 col-span-2">
        <Tabs />
      </div>

      <div className=" row-start-2 col-start-4 col-span-2">
        <Comments />
      </div>
    </div>
  );
};
