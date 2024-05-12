import { ReactNode, useMemo } from "react";
import { DBAction } from "@schemas/twitch/Actions";
import { Fragment } from "@schemas/twitch/Fragment";
import { DBUser } from "@schemas/twitch/User";
import { useLiveQuery } from "dexie-react-hooks";
import * as escaper from "html-escaper";

import { dbPagination, useDbPagination } from "@resource/db";
import { useUserContext } from "@contexts/twitch/userContext";
import { dayjs } from "@libs/dayjs";
import { urlLinkTagReplacement } from "@libs/regex";
import { getEmoteImage, twitchLinks } from "@libs/twitch";
import { filter } from "@libs/types";
import { useAsyncMemo } from "@libs/uses";

import { ChatBubble, ChatSkeleton } from "@components/dasyui/ChatBubble";
import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";
import { getActions } from "../../watcher/useCommentWatcher";
import { useUserInfoModal } from "./User";

interface Comment {
  id: string;
  type: DBAction["messageType"];
  userId: DBUser["id"];
  fragment: ReactNode;
  timestamp: number;
}

const commentParser = (action: DBAction): Comment | undefined => {
  if (action.userId == null) return;
  if (action.timestamp == null) return;
  switch (action.messageType) {
    case "chat":
      if (action.fragments == null || action.fragments.length === 0) {
        return {
          id: action.id,
          type: action.messageType,
          userId: action.userId,
          fragment: <span>{action.message}</span>,
          timestamp: action.timestamp,
        };
      }
      return {
        id: action.id,
        type: action.messageType,
        userId: action.userId,
        fragment: <ParseFragment fragments={action.fragments} />,
        timestamp: action.timestamp,
      };
    case "atutomatic-reward":
      // TODO: 一旦実装しない
      return;
    case "reward":
      return {
        id: action.id,
        type: action.messageType,
        userId: action.userId,
        fragment: <span>{action.userTitle}</span>,
        timestamp: action.timestamp,
      };
    default:
      return;
  }
};

const ParseFragment = (props: { fragments: Fragment[] }) => {
  return (
    <>
      {props.fragments.map((fragment, index) => {
        switch (fragment.type) {
          case "emote":
            return (
              <img
                key={index}
                src={getEmoteImage(fragment.emote.id)}
                alt={fragment.text}
                className="inline mx-1"
              />
            );
          case "text":
            return (
              <span
                key={index}
                className="break-all"
                dangerouslySetInnerHTML={{
                  __html: urlLinkTagReplacement(escaper.escape(fragment.text)),
                }}
              />
            );
          case "mention":
            return (
              <a
                className="link link-info"
                target="__blank"
                key={index}
                href={twitchLinks(fragment.mention.user_login).CHANNEL}>
                {fragment.text}
              </a>
            );
        }
      })}
    </>
  );
};

const Reward = (props: Comment) => {
  const userContext = useUserContext();
  const user = useAsyncMemo(async () => {
    return userContext.fetchById(props.userId);
  }, [props.userId]);
  const userName = useMemo(() => user?.displayName || user?.login, [user]);
  const openModal = useUserInfoModal(props.userId);

  if (user == null) return;
  return (
    <li className="flex justify-center">
      <div className="flex items-center gap-2">
        <img
          src={user.profileImageUrl}
          alt={user.login}
          className="rounded-full w-10 border-2 overflow-hidden cursor-pointer"
          tabIndex={0}
          onClick={() => openModal()}
        />
        <div className="flex font-bold">
          {userName}が{props.fragment}と交換しました。
        </div>
      </div>
    </li>
  );
};

const Bubble = (props: Comment) => {
  const userContext = useUserContext();
  const user = useAsyncMemo(async () => {
    return userContext.fetchById(props.userId);
  }, [props.userId]);
  const userName = useMemo(() => user?.displayName || user?.login, [user]);
  const openModal = useUserInfoModal(props.userId);

  if (user == null) return <ChatSkeleton hasImage hasFooter hasHeader />;
  return (
    <li>
      <ChatBubble
        type="chat-end"
        image={{
          src: user.profileImageUrl,
          alt: user.login,
        }}
        header={userName}
        footer={dayjs(props.timestamp).format("HH:MM:ss")}
        message={props.fragment}
        onClickAvater={() => openModal()}
      />
    </li>
  );
};
const Flat = (props: Comment) => {
  return <li className="border-b pb-1">{props.fragment}</li>;
};

const TypeViewer = (props: Comment) => {
  switch (props.type) {
    case "chat":
      return <Bubble {...props} />;
    case "reward":
      return <Reward {...props} />;
    case "atutomatic-reward":
      return null;
  }
};

const TypeFlat = (props: Comment) => {
  switch (props.type) {
    case "chat":
      return <Flat {...props} fragment={<>{props.fragment}</>} />;
    case "reward":
      return (
        <Flat
          {...props}
          fragment={
            <span className="font-bold flex justify-between">
              <span>{props.fragment}</span> <span className="text-xs">ポイント交換</span>
            </span>
          }
        />
      );
    case "atutomatic-reward":
      return null;
  }
};

export const ChatList = (props: {
  type: "viewewr" | "flat";
  query: Parameters<typeof getActions>[0];
}) => {
  const comments = useLiveQuery(async () => {
    return getActions(props.query).sortBy("timestamp");
  }, []);
  const messages = useMemo(() => {
    if (comments == null) return;
    return comments
      .map(commentParser)
      .filter(filter.notNull)
      .map((action) => {
        switch (props.type) {
          case "viewewr":
            return <TypeViewer key={action.id} {...action} />;
          case "flat":
            return <TypeFlat key={action.id} {...action} />;
        }
      });
  }, [comments]);

  const scroll = usePerfectScrollbar([comments]);

  return (
    <div className="h-full perfect-scrollbar" ref={scroll.ref}>
      <ul className="flex flex-col gap-4 py-6">{messages}</ul>
    </div>
  );
};

export const ChatTable = (props: { userId: DBUser["id"] }) => {
  const type: string = "flat";

  const data = useDbPagination(
    getActions({
      type: "userId",
      userId: props.userId,
    }),
    {
      pageNo: 0,
      pageSize: 20,
    },
    [props.userId],
  );

  const message = useMemo(() => {
    if (data.value == null) return <></>;
    return data.value.target
      .map(commentParser)
      .filter(filter.notNull)
      .map((action) => {
        switch (type) {
          case "viewer":
            return <TypeViewer key={action.id} {...action} />;
          case "flat":
            return <TypeFlat key={action.id} {...action} />;
        }
      });
  }, [data]);
  const scroll = usePerfectScrollbar([props.userId]);
  return (
    <div className="h-full flex flex-col">
      <div ref={scroll.ref} className="perfect-scrollbar">
        <ul className="flex flex-col gap-2 py-6 px-2">{message}</ul>
      </div>
      <div className="flex justify-between border-t-2 items-center select-none">
        <div className="flex">
          <button
            className="btn btn-ghost btn-xs"
            onClick={data.prev}
            disabled={!data.value?.hasPrev}>
            prev
          </button>
          <p>&nbsp;</p>
          <button
            className="btn btn-ghost btn-xs"
            onClick={data.next}
            disabled={!data.value?.hasNext}>
            next
          </button>
        </div>
        <div className="px-2 py-1 text-right">総コメント数:{data.value?.count}</div>
      </div>
    </div>
  );
};
