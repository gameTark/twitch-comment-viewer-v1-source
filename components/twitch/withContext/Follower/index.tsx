import { createContext, ReactNode, useContext } from "react";
import { DBUser } from "@schemas/twitch/User";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@resource/db";
import { filter } from "@libs/types";

import { ContextElements, createTime } from "../interface";
import { DBFollower } from "@schemas/twitch/Followers";

const followerContext = createContext<DBFollower | undefined>(undefined);
const useFollowerContext = () => useContext(followerContext);

const ListProvider = (props: ContextElements["Ul"]) => {
  const { children, ...p } = props;
  const data = useLiveQuery(async () => {
    const me = await db.getMe();
    if (me == null) return [];
    const exists = await db.followers.where("channelId").equals(me.id).sortBy("followedAt");
    return exists
      .reverse()
      .filter(filter.notDeleted)
      .filter((val) => val.deletedAt == null);
  }, []);

  return (
    <ul {...p}>
      {data?.map((val) => <FollowerProvider value={val}>{children}</FollowerProvider>)}
    </ul>
  );
};
const RecordProvider = (props: ContextElements["TypeTableSelection"]) => {
  const { children, ...p } = props;
  const data = useLiveQuery(async () => {
    const me = await db.getMe();
    if (me == null) return [];
    const exists = await db.followers.where("channelId").equals(me.id).sortBy("followedAt");
    return exists
      .reverse()
      .filter(filter.notDeleted)
      .filter((val) => val.deletedAt == null);
  }, []);

  return (
    <tbody {...p}>
      {data?.map((val) => (
        <FollowerProvider key={val.id} value={val}>
          {children}
        </FollowerProvider>
      ))}
    </tbody>
  );
};
const FollowerProvider = ({
  value,
  children,
}: {
  value: DBFollower | undefined;
  children: ReactNode;
}) => {
  return <followerContext.Provider value={value}>{children}</followerContext.Provider>;
};
const Provider = ({ id, children }: { id: DBUser["id"]; children: ReactNode }) => {
  const follower = useLiveQuery(async () => {
    return await db.followers.where("userId").equals(id).first();
  }, [id]);
  return <followerContext.Provider value={follower}>{children}</followerContext.Provider>;
};
const ListItem = (props: ContextElements["Li"]) => {
  return <li {...props} />;
};
const FollowedAt = createTime(useFollowerContext, ["followedAt"]);

const Badge = (props: { type?: "icon" | "tag" }) => {
  const ctx = useFollowerContext();
  const type = props.type || "tag";
  switch (type) {
    case "tag": {
      if (ctx == null)
        return <span className="badge badge-info badge-sm opacity-30 select-none">フォロワー</span>;
      return <span className="badge badge-info badge-sm select-none">フォロワー</span>;
    }
    case "icon": {
      if (ctx == null) return <span className="opacity-0 select-none">♡</span>;
      return <span className=" text-accent select-none">♥</span>;
    }
  }
};

type Provider = (props: { id?: string; children: ReactNode }) => ReactNode;

const UserProvider = (props: { children: ReactNode; Povider: Provider }) => {
  const ctx = useFollowerContext();
  return <props.Povider id={ctx?.userId}>{props.children}</props.Povider>;
};

export const Follower = {
  ListProvider,
  ListItem,
  RecordProvider,
  Provider,
  FollowedAt,
  UserProvider,
  Badge,
};
