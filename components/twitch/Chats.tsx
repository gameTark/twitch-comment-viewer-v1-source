import { ReactNode, useCallback, useMemo } from "react";
import * as escaper from "html-escaper";

import { DbAction, DbUser } from "@resource/db";
import { useEventSubContext } from "@contexts/twitch/eventSubContext";
import { useUserGetById } from "@contexts/twitch/userContext";
import { dayjs } from "@libs/dayjs";
import { ChatFragment } from "@libs/notification/channelChatMessage";
import { urlLinkTagReplacement } from "@libs/regex";
import { getEmoteImage, twitchLinks } from "@libs/twitch";
import { filter } from "@libs/types";

import { ChatBubble, ChatSkeleton } from "@components/dasyui/ChatBubble";
import { useModalContext } from "@components/dasyui/Modal";
import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";
import { useGetComments, useGetCommentsByUserId } from "../../watcher/useCommentWatcher";
import { UserInformation, useUserInfoModal } from "./User";

interface Comment {
  id: string;
  type: DbAction["messageType"];
  userId: DbUser["id"];
  fragment: ReactNode;
  timestamp: number;
}


const commentParser = (action: DbAction): Comment | undefined => {
  if (action.userId == null) return;
  if (action.timestamp == null) return;
  switch (action.messageType) {
    case "chat":
      if (action.fragments == null || action.fragments.length === 0) {
        return {
          id: action.id,
          type: action.messageType,
          userId: action.userId,
          fragment: <p>{action.message}</p>,
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
        fragment: <p>{action.userTitle}</p>,
        timestamp: action.timestamp,
      };
    default:
      return;
  }
};

const ParseFragment = (props: { fragments: ChatFragment[] }) => {
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
  const user = useUserGetById(props.userId);
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
          onClick={openModal}
        />
        <div className="flex">
          {userName}が{props.fragment}と交換しました。
        </div>
      </div>
    </li>
  );
};

const Bubble = (props: Comment) => {
  const user = useUserGetById(props.userId);
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
        footer={dayjs(props.timestamp).format("HH:MM:SS")}
        message={props.fragment}
        onClickAvater={openModal}
      />
    </li>
  );
};
const Flat = (props: Comment) => {
  return <li>{props.fragment}</li>;
};

const TypeViewer = (props: Comment) => {
  switch (props.type) {
    case "chat":
      return <Bubble key={props.id} {...props} />;
    case "reward":
      return <Reward key={props.id} {...props} />;
    case "atutomatic-reward":
      return null;
  }
};

const TypeFlat = (props: Comment) => {
  return <Flat {...props} />;
};

export const ChatList = () => {
  const comments = useGetComments();
  const type: string = "viewer";

  const message = useMemo(() => {
    return comments
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
  }, [comments]);

  const scroll = usePerfectScrollbar([comments]);
  return (
    <div className="h-full perfect-scrollbar" ref={scroll.ref}>
      <ul className="flex flex-col gap-4 py-6">{message}</ul>
    </div>
  );
};

export const ChatTable = (props: { userId?: DbUser["id"] }) => {
  const ctx = useEventSubContext();
  const comments = useGetCommentsByUserId(props.userId || ctx?.me.id || null);
  const scroll = usePerfectScrollbar([comments]);
  return (
    <div className="h-full flex flex-col">
      <div ref={scroll.ref} className="perfect-scrollbar">
        <ul className="flex flex-col">
          {comments.length === 0 ? <p>まだコメントが収集できてないです。</p> : null}
          {comments
            .map((val) => {
              if (val.messageType === "chat") {
                const target =
                  val.fragments != null && val.fragments.length !== 0 ? (
                    <ParseFragment fragments={val.fragments} />
                  ) : (
                    val.message
                  );
                return (
                  <li
                    key={val.id}
                    className="break-words flex items-center px-2 justify-stretch border-b  border-base-300">
                    <time className="opacity-70 text-xs pr-1 whitespace-nowrap">
                      {dayjs(val.timestamp).format("YYYY/MM/DD hh:mm:ss")}
                    </time>
                    <p className="px-2 py-1 border-l border-base-300">{target}</p>
                  </li>
                );
              }
            })
            .filter(filter.notNull)}
        </ul>
      </div>
      <div className="px-2 py-1 border-t-2 text-right">総コメント数:{comments.length}</div>
    </div>
  );
};
