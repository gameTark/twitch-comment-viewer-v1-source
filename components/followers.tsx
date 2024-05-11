import { useMemo } from "react";

import { useTwitchFollowersGetById } from "@resource/twitchWithDb";
import { useEventSubContext } from "@contexts/twitch/eventSubContext";
import { useGetUserMap } from "@contexts/twitch/userContext";
import { dayjs } from "@libs/dayjs";
import { filter } from "@libs/types";

import { Stat } from "./dasyui/Stat";
import { Table } from "./dasyui/Table";
import { ICONS } from "./icons";

const TypeTable = () => {
  const ctx = useEventSubContext();
  const followers = useTwitchFollowersGetById(ctx?.me.id);
  const userMap = useGetUserMap(followers?.map((val) => val.userId) || []);

  const userWithFollower = useMemo(() => {
    if (followers == null || userMap == null) return [];
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
  }, [followers, userMap]);

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
              <img src={val.profileImageUrl} alt={val.login} width={35} className="rounded-full" />
            );
          },
        },
        {
          keyName: "displayName",
          displayName: "名前",
          parse: (val) => val.displayName || val.login || "none",
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
  // const userInfo = useShowUserInfoModal();

  // const tableInfo = useMemo(() => {
  //   if (followers == null || userMap == null) return null;
  //   return {
  //     keyMap: [
  //       {
  //         keyName: "image",
  //         displayName: "アイコン",
  //       },
  //       {
  //         keyName: "name",
  //         displayName: "名前",
  //       },
  //       {
  //         keyName: "followedAt",
  //         displayName: "フォロー開始日",
  //       },
  //     ],
  //     target: followers
  //       .map((val): { [key: string]: TableValueType } | undefined => {
  //         const user = userMap.get(val.userId);
  //         if (user == null) return;
  //         return {
  //           name: {
  //             type: "jsx",
  //             value: (
  //               <p>
  //                 <a
  //                   className="cursor-pointer"
  //                   onClick={() => {
  //                     userInfo.open(user.id);
  //                   }}>
  //                   {user.displayName || user.login}
  //                 </a>
  //               </p>
  //             ),
  //           },
  //           image: {
  //             type: "jsx",
  //             value: (
  //               <div className="avatar">
  //                 <div
  //                   className="w-7 rounded-full cursor-pointer"
  //                   onClick={() => {
  //                     userInfo.open(user.id);
  //                   }}>
  //                   <img src={user.profileImageUrl} />
  //                 </div>
  //               </div>
  //             ),
  //           },
  //           followedAt: {
  //             type: "date",
  //             value: val.followedAt,
  //             format: "YYYY/MM/DD HH:mm (ddd)",
  //           },
  //         };
  //       })
  //       .filter(filter.notNull),
  //   };
  // }, [f, userMap]);

  // if (tableInfo == null) return;

  // return <Table type="object" {...tableInfo} />;
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
