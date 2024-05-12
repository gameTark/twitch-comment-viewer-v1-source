import { ChangeEventHandler, useCallback, useEffect, useMemo, useState } from "react";
import { DBUser } from "@schemas/twitch/User";
import clsx from "clsx";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@resource/db";
import {
  useSpamCheck,
  useTiwtchUpdateUserById,
  useTwitchFollowersGetById,
} from "@resource/twitchWithDb";
import { useUserContext } from "@contexts/twitch/userContext";
import { dayjs } from "@libs/dayjs";
import { fetchChannelFollowers } from "@libs/twitch";
import { useAsyncMemo } from "@libs/uses";

import { DasyBadge, DasyBadgeType } from "@components/dasyui/Badge";
import { useModalContext } from "@components/dasyui/Modal";
import { ICONS } from "@components/icons";
import { ChatTable } from "./Chats";

interface BadgeProps {
  name: string;
  type: DasyBadgeType;
  disabled?: boolean;
}
const Badge = (props: BadgeProps) => {
  return (
    <span className={clsx({ "opacity-30": props.disabled })}>
      <DasyBadge type={props.type} size="badge-sm">
        {props.name}
      </DasyBadge>
    </span>
  );
};

export const useUserInfoModal = (userId?: DBUser["id"]) => {
  const modal = useModalContext();
  const openModal = useCallback(
    (_userId?: DBUser["id"]) => {
      const u = _userId || userId;
      if (u == null) return;
      modal.open(<UserInformation userId={u} />);
    },
    [userId],
  );
  return openModal;
};

export const UserInformation = (props: { userId: DBUser["id"] }) => {
  const me = useLiveQuery(() => db.getMe(), []);
  const userContext = useUserContext();
  const user = useAsyncMemo(async () => {
    return await userContext.fetchById(props.userId);
  }, [props.userId]);
  const followers = useTwitchFollowersGetById(me?.id);

  const update = useTiwtchUpdateUserById(props.userId);
  const followed = useMemo(() => {
    if (followers == null) return null;
    const followedAt = followers.find((val) => val.userId === props.userId)?.followedAt || null;
    if (followedAt == null) return null;
    return dayjs(followedAt);
  }, [me, props.userId]);

  const [bio, setBio] = useState<string>("");
  // component will mount
  useEffect(() => {
    if (user == null) return;
    setBio(user.metaComment || "");
  }, [user]);

  const updateUserInfo: ChangeEventHandler<HTMLTextAreaElement> = useCallback((e) => {
    setBio(e.currentTarget.value);
    update({
      metaComment: e.currentTarget.value,
    });
  }, []);
  const isSpam = useSpamCheck(user?.login);
  const badge = useMemo(() => {
    return (
      <ul className="flex gap-2">
        <li>
          <Badge name="フォロワー" type="badge-info" disabled={followed == null} />
        </li>
        {isSpam ? (
          <li>
            <Badge name="悪質なボット" type="badge-error" />
          </li>
        ) : null}
      </ul>
    );
  }, [followed, me, user, isSpam]);

  const followerCount = useAsyncMemo(async () => {
    if (user == null) return;
    return fetchChannelFollowers({
      broadcaster_id: user.id,
    }).then((res) => res.total);
  }, [user]);

  if (user == null)
    return (
      <div className="flex flex-col gap-4 w-52">
        <div className="flex gap-4 items-center">
          <div className="skeleton w-40 h-40 rounded-full shrink-0"></div>
          <div className="flex flex-col gap-4">
            <div className="skeleton h-4 w-20"></div>
            <div className="skeleton h-4 w-28"></div>
          </div>
        </div>
        <div className="skeleton h-32 w-full"></div>
      </div>
    );
  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-6 content-stretch bg-cover">
        <div className="chat-image avatar dropdown dropdown-end select-none">
          <div className="w-40 rounded-full border">
            <img alt={user.displayName} src={user.profileImageUrl} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p>名前: {user.displayName || user.login}</p>
          <p>ID: {user.id}</p>
          <p>フォロワー数: {followerCount}</p>
          {followed && (
            <>
              <p>フォロー開始日: {followed.format("YYYY/MM/DD")}</p>
              <p>フォロー開始日: {followed.from(dayjs())}</p>
            </>
          )}
          <div className="mt-auto select-none">{badge}</div>
        </div>
      </div>
      <div>
        <p>
          <a
            className="link link-info flex gap-1 py-2 items-center"
            target="__blank"
            href={`https://www.twitch.tv/${user.login}`}>
            Twitch {ICONS.EXTERNAL}
          </a>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-black">BIO</p>
        <textarea
          className="textarea textarea-bordered leading-4"
          placeholder="Bio"
          rows={6}
          cols={50}
          value={bio}
          onChange={updateUserInfo}
        />
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-black">コメント一覧</p>
        <div className="h-56 border rounded-md">
          <ChatTable userId={user.id} />
        </div>
      </div>
    </div>
  );
};
