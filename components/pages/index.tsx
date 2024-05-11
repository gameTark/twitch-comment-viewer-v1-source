"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { useEventSubContext } from "@contexts/twitch/eventSubContext";

import { ChatUsers } from "@components/chatUsers";
import { Clock, MiniClock } from "@components/commons/clock";
import { DrawerOpener } from "@components/dasyui/Drawer";
import { FollowerInfo } from "@components/followers";
import { ICONS } from "@components/icons";
import { LiveWatchUsers } from "@components/liveWatchUsers";
import { ChatList } from "@components/twitch/Chats";
import { Me } from "@components/twitch/Me";

const FOOTER_CONTENT = [
  { icon: ICONS.BROADCAST, text: "ライブ", path: "/" },
  { icon: ICONS.GAME, text: "ゲーム", path: "/games" },
  // { icon: ICONS.FOLLOW, text: "フォロワー", path: "/followers" },
  // { icon: ICONS.REWARD, text: "報酬管理", path: "/reward" },
  // { icon: ICONS.TODO, text: "TODO", path: "/todo" },
  { icon: ICONS.DATABASE, text: "集計データ", path: "/database" },
  { icon: ICONS.GEAR, text: "設定", path: "/setting" },
];

export const BroadcastContent = () => {
  const ctx = useEventSubContext();

  if (ctx == null) return;
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
            <ChatList />
          </div>
        </div>
      </div>
    </div>
  );
};
const FooterContent = (props: {
  icon: ReactNode;
  text: string;
  active?: boolean;
  path: string;
}) => {
  const active = props.active || false;
  const activate = clsx(
    {
      "opacity-50": !active,
      "opacity-100": active,
    },
    "transition-opacity transition-transform",
  );
  return (
    <Link
      className={clsx(
        "flex flex-col items-center cursor-pointer h-full justify-between w-16 whitespace-nowrap",
        activate,
      )}
      href={props.path}
      as={props.path}>
      <span>{props.icon}</span>
      <p className="text-xs font-black ">{props.text}</p>
    </Link>
  );
};

const FooterContentList = () => {
  const pathname = usePathname();
  return (
    <nav className="flex gap-4 grow items-end">
      {FOOTER_CONTENT.map((val) => (
        <FooterContent key={val.path} {...val} active={val.path === pathname} />
      ))}
    </nav>
  );
};

export const Footer = () => {
  const ctx = useEventSubContext();
  if (ctx == null) return;

  return (
    <footer className="footer items-center bg-primary flex text-primary-content sticky bottom-0 h-fit mt-auto py-3 px-4">
      <div className="flex gap-4 items-center grow">
        <Me />
        <FooterContentList />
        <div className="flex gap-4 items-center">
          <div className="flex flex-col">
            <p className="text-xs">配信時間</p>
            <Clock startMilliSeconds={ctx.live?.startedAt?.getTime()} />
          </div>
          <div>
            <MiniClock />
          </div>
          <div>
            <DrawerOpener>{ICONS.NOTIFICATION}</DrawerOpener>
          </div>
        </div>
      </div>
    </footer>
  );
};
