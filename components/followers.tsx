import { useMemo } from "react";

import { useTwitchFollowersGetById } from "@resource/twitchWithDb";
import { useEventSubContext } from "@contexts/twitch/eventSubContext";
import { useGetUserMap, useUserContextState } from "@contexts/twitch/userContext";
import { dayjs } from "@libs/dayjs";
import { filter } from "@libs/types";

import { Stat } from "./dasyui/Stat";
import { Table, TableSkeleton } from "./dasyui/Table";
import { ICONS } from "./icons";
import { useUserInfoModal } from "./twitch/User";

const TypeTable = () => {
  const ctx = useEventSubContext();
  const state = useUserContextState();
  const followers = useTwitchFollowersGetById(ctx?.me.id);
  const userMap = useGetUserMap(followers?.map((val) => val.userId) || []);
  const modal = useUserInfoModal();

  const userWithFollower = useMemo(() => {
    if (followers == null || userMap == null) return null;
    return followers
      .map((val) => {
        const user = userMap.get(val.userId);
        if (user == null) return;
        return {
          ...user,
          ...val,
        };
      })
      .filter(filter.notNull);
  }, [followers, userMap, state]);

  if (userWithFollower == null || userWithFollower.length === 0) return <TableSkeleton />
  return (
    <Table
      type="object"
      target={userWithFollower}
      keyMap={[
        {
          keyName: "profileImageUrl",
          displayName: "画像",
          parse: (val) => {
            return (
              <img
                src={val.profileImageUrl}
                onClick={() => {
                  modal(val.userId);
                }}
                tabIndex={0}
                alt={val.login}
                width={35}
                className="rounded-full cursor-pointer"
              />
            );
          },
        },
        {
          keyName: "displayName",
          displayName: "名前",
          parse: (val) => (
            <p onClick={() => modal(val.userId)} tabIndex={0} className=" cursor-pointer">
              {val.displayName || val.login || "none"}
            </p>
          ),
        },
        {
          keyName: "followedAt",
          displayName: "フォロー開始日",
          parse: (val) => {
            return dayjs(val.followedAt).format("YYYY/MM/DD hh:mm:ss(ddd)");
          },
        },
      ]}
      consecutive
    />
  );
};

export const FollowerInfo = (props: { type: "list" | "stat" | "table" }) => {
  const ctx = useEventSubContext();
  const followers = useTwitchFollowersGetById(ctx?.me.id);

  if (followers == null) return;
  switch (props.type) {
    case "table":
      return <TypeTable />;
    case "list":
      return (
        <div>
          <h2>info</h2>
          <ul>
            {followers.map((val) => {
              return (
                <li key={val.userId}>
                  <p>{dayjs(val.followedAt).format("YYYY/MM/DD HH:mm:ss")}</p>
                </li>
              );
            })}
          </ul>
        </div>
      );
    case "stat":
      return <Stat title="フォロワー数" value={`${followers.length}人`} icon={ICONS.FOLLOW} />;
  }
};
