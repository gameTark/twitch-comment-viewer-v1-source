import { useMemo } from "react";
import clsx from "clsx";
import dayjs from "dayjs";

import { useCommentCount } from "@resource/twitchWithDb";
import { filter } from "@libs/types";

import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";
import { useGetComments } from "../watcher/useCommentWatcher";
import { Chat } from "./chat";
import { ChatAction, TwitchChat } from "./chatBubble";
import { Stat } from "./dasyui/Stat";
import { Table, TableValueType } from "./dasyui/Table";
import { ICONS } from "./icons";

// TODO: 無限スクロール解決をする

const TypeTable = () => {
  const comments = useGetComments();
  const sortedComments = useMemo(() => {
    return comments
      .sort((a, b) => (Number(a.userId || "") < Number(b.userId || "") ? 1 : -1))
      .map((val) => {
        if (val.messageType !== "chat") return;
        return {
          ...val,
          comments: <Chat fragments={val.fragments} />,
        };
      })
      .filter(filter.notNull);
  }, [comments]);
  return (
    <Table
      type="object"
      target={sortedComments}
      keyMap={[
        {
          keyName: "id",
        },
        {
          keyName: "userId",
          displayName: "ユーザーID",
        },
        {
          keyName: "comments",
          displayName: "コメント",
        },
      ]}
    />
  );
};

const TypeStat = () => {
  const count = useCommentCount();
  return <Stat icon={ICONS.COMMENT} value={`${count}件`} title="本日のコメント数" />;
};

const TypeList = () => {
  const comments = useGetComments();
  const ps = usePerfectScrollbar([comments], {
    suppressScrollX: true,
  });
  return (
    <div className={clsx("w-full px-4 py-2 bg-base-100 perfect-scrollbar")} ref={ps.ref}>
      <ul className="flex flex-col">
        {comments.map((chat) => {
          if (chat.timestamp == null) return <></>;
          if (chat.messageType === "atutomatic-reward") return <></>;
          if (chat.messageType === "reward") {
            return (
              <li key={chat.id}>
                <ChatAction
                  id={chat.id}
                  userId={chat.userId || ""}
                  time={dayjs(chat.timestamp).format("HH:mm:ss")}
                  title={chat.userTitle}
                  input={chat.userInput}
                />
              </li>
            );
          }
          const date = new Date(chat.timestamp);
          const fragments =
            chat.fragments == null || chat.fragments.length == 0 ? undefined : (
              <Chat fragments={chat.fragments} />
            );
          return (
            <li key={chat.id}>
              <TwitchChat
                type="mini"
                id={chat.id}
                time={dayjs(date).format("HH:mm:ss")}
                message={fragments || chat.message}
                userId={chat.userId || ""}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const CommentList = (props: { type: "list" | "stat" | "table" }) => {
  switch (props.type) {
    case "list":
      return <TypeList />;
    case "stat":
      return <TypeStat />;
    case "table":
      return <TypeTable />;
  }
};
