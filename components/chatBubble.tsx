import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@resource/db";
import { useTwitchGetByUserId } from "@resource/twitchWithDb";
import { useUserContext } from "@contexts/twitch/userContext";

import { ChatBubble, ChatSkeleton } from "./dasyui/ChatBubble";
import { useShowUserInfoModal } from "./dasyui/Modal";

const Memo = (props: { userId: string }) => {
  const [bio, setBio] = React.useState<string>("");
  // component will mount
  React.useEffect(() => {
    const user = db.users.where("id").equals(props.userId).first();
    user.then((res) => {
      if (res == null) return;
      setBio(res.metaComment || "");
    });
  }, [props.userId]);

  return (
    <label className="form-control">
      <div className="label">
        <span className="label-text">BIO</span>
      </div>
      <textarea
        className="textarea textarea-bordered leading-4"
        placeholder="Bio"
        value={bio}
        onChange={(e) => {
          setBio(e.currentTarget.value);
          db.users.update(props.userId, {
            metaComment: e.currentTarget.value,
          });
        }}></textarea>
      <div className="label">
        <span className="label-text-alt"></span>
        <span className="label-text-alt">{bio.length}</span>
      </div>
    </label>
  );
};

export interface ChatActionProps {
  id: string;
  userId: string;
  time: string;
  title: string;
  input?: string;
}
export const ChatAction = (props: ChatActionProps) => {
  const user = useTwitchGetByUserId(props.userId);
  if (user == null) return;
  return (
    <div className="flex justify-center items-center gap-4">
      <div className="chat-image avatar dropdown dropdown-end">
        <div className="w-10 rounded-full" tabIndex={0} role="button">
          <img alt={user.displayName} src={user.profileImageUrl} />
        </div>
      </div>
      <p className="opacity-80 font-black pb-1">
        {user?.displayName || user?.login}が 「{props.title}」 を交換しました。
      </p>
    </div>
  );
};

export interface TwitchChatProps {
  type?: "full" | "medium" | "mini" | "chat-only"; // MとCOのみ
  id: string;
  time: string;
  message: React.ReactNode;
  userId: string;
}
export const TwitchChat = (props: TwitchChatProps) => {
  const type = props.type || "medium";
  const userInfo = useShowUserInfoModal();
  const userContext = useUserContext();
  const user = useLiveQuery(() => userContext.fetchUserById(props.userId), [props.userId]);
  const clickUser = React.useCallback(() => {
    if (user == null) return;
    userInfo.open(user.id);
  }, [user]);

  const hasDisplayName = user?.displayName != null && user?.displayName !== user?.login;
  if (user == null) return <ChatSkeleton hasFooter hasHeader hasImage />;
  if (type === "chat-only") {
    const form = (
      <ul tabIndex={0} className="dropdown-content z-[1] w-64 shadow bg-base-100 p-2">
        <li>
          <Memo userId={props.userId} />
        </li>
      </ul>
    );
    return (
      <div className="chat chat-start">
        <div className="dropdown dropdown-start">
          {props.message}
          {form}
        </div>
      </div>
    );
  }

  return (
    <ChatBubble
      type="chat-end"
      image={{
        src: user.profileImageUrl,
        alt: user.login,
      }}
      onClickAvater={clickUser}
      message={props.message}
      header={
        hasDisplayName ? (
          <div className="flex gap-1 items-end">
            <span className="text-xs opacity-50">{user.login}</span>
            <span className="text-sm">{user.displayName}</span>
          </div>
        ) : (
          user.login
        )
      }
      footer={<time className="text-xs opacity-50">{props.time}</time>}
    />
  );
};
