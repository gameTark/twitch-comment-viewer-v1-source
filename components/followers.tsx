import { useMemo } from "react";

import { useEventSubContext } from "@contexts/twitch/eventSubContext";
import { useGetUserMap } from "@contexts/twitch/userContext";
import { dayjs } from "@libs/dayjs";
import { filter } from "@libs/types";

import { useShowUserInfoModal } from "./dasyui/Modal";
import { Stat } from "./dasyui/Stat";
import { Table, TableValueType } from "./dasyui/Table";
import { ICONS } from "./icons";

const TypeTable = () => {
  const ctx = useEventSubContext();
  const followerIds = useMemo(() => ctx?.followers.map((val) => val.userId) || [], [ctx]);
  const userMap = useGetUserMap(followerIds);

  const followers = useMemo(() => {
    if (ctx?.followers == null) return [];
    return ctx.followers.sort((a, b) => (a.followedAt < b.followedAt ? 1 : -1));
  }, [ctx?.followers]);

  const userInfo = useShowUserInfoModal();
  const tableInfo = useMemo(() => {
    if (followers == null || userMap == null) return null;
    return {
      keyMap: [
        {
          keyName: "image",
          displayName: "アイコン",
        },
        {
          keyName: "name",
          displayName: "名前",
        },
        {
          keyName: "followedAt",
          displayName: "フォロー開始日",
        },
      ],
      target: followers
        .map((val): { [key: string]: TableValueType } | undefined => {
          const user = userMap.get(val.userId);
          if (user == null) return;
          return {
            name: {
              type: "jsx",
              value: (
                <p>
                  <a
                    className="cursor-pointer"
                    onClick={() => {
                      userInfo.open(user.id);
                    }}>
                    {user.displayName || user.login}
                  </a>
                </p>
              ),
            },
            image: {
              type: "jsx",
              value: (
                <div className="avatar">
                  <div
                    className="w-7 rounded-full cursor-pointer"
                    onClick={() => {
                      userInfo.open(user.id);
                    }}>
                    <img src={user.profileImageUrl} />
                  </div>
                </div>
              ),
            },
            followedAt: {
              type: "date",
              value: val.followedAt,
              format: "YYYY/MM/DD HH:mm (ddd)",
            },
          };
        })
        .filter(filter.notNull),
    };
  }, [followers, userMap]);

  if (tableInfo == null) return;

  return <Table type="object" {...tableInfo} />;
};

export const FollowerInfo = (props: { type: "list" | "stat" | "table" }) => {
  const ctx = useEventSubContext();

  if (ctx == null) return;
  switch (props.type) {
    case "table":
      return <TypeTable />;
    case "list":
      return (
        <div>
          <h2>info</h2>
          <ul>
            {ctx.followers.map((val) => {
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
      return <Stat title="フォロワー数" value={`${ctx.followers.length}人`} icon={ICONS.FOLLOW} />;
  }
};
