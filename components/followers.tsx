import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@resource/db";
import { useTwitchFollowersGetById } from "@resource/twitchWithDb";
import { useEventSubContext } from "@contexts/twitch/eventSubContext";
import { useUserContext } from "@contexts/twitch/userContext";
import { dayjs } from "@libs/dayjs";
import { filter } from "@libs/types";
import { useAsyncMemo } from "@libs/uses";

import { Stat } from "./dasyui/Stat";
import { Table, TableSkeleton } from "./dasyui/Table";
import { ICONS } from "./icons";
import { useUserInfoModal } from "./twitch/User";

const TypeTable = () => {
  const me = useLiveQuery(() => db.getMe(), []);
  const followers = useTwitchFollowersGetById(me?.id);
  const userContext = useUserContext();
  const modal = useUserInfoModal();

  const userWithFollower = useAsyncMemo(async () => {
    if (followers == null) return null;
    return Promise.all(
      followers
        .map(async (val) => {
          const user = await userContext.fetchById(val.userId);
          return {
            ...user,
            ...val,
          };
        })
        .filter(filter.notNull),
    );
  }, [followers]);

  if (userWithFollower == null) return <TableSkeleton />;
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
  const me = useLiveQuery(() => db.getMe(), []);
  const followers = useTwitchFollowersGetById(me?.id);

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
