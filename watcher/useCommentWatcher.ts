import { useLiveQuery } from "dexie-react-hooks";

import { useEventSubContext } from "../contexts/twitch/eventSubContext";
import { db, DbComment } from "../resource/db";
import { getUsers } from "../resource/twitchWithDb";

export const useGetAllComments = () => {
  const sub = useEventSubContext();
  const channel = sub?.me.channelName;
  const comments = useLiveQuery(async () => {
    if (channel == null) return;
    const resutl = await db.actions.toArray();
    // 後位一致させるため、便利なメソッドが別にあるかも
    return resutl.reverse();
  }, [channel]);

  return comments || [];
};

export const useTwitchUsers = (userIds: string[]) => {
  const queries = useLiveQuery(async () => {
    return getUsers(userIds);
  }, [userIds]);
  if (queries == null) return null;
  return {
    getUserById: (id: string) => {
      return queries.find((val) => val.id === id);
    },
    getAll: () => queries,
  };
};
export const useGetCommentsByUserId = (
  userId: DbComment["userId"],
  options?: {
    limit?: number;
  },
) => {
  const limit = options?.limit || Infinity;
  return (
    useLiveQuery(async () => {
      if (userId == null) return;
      const result = await db.actions
        .where("userId")
        .equals(userId)
        .reverse()
        .limit(limit)
        .sortBy("timestamp");
      return result;
    }, [userId]) || []
  );
};

export const useGetComments = (options?: { limit?: number; before?: Date; after?: Date }) => {
  const sub = useEventSubContext();
  const channel = sub?.me.channelName;
  const limit = options?.limit || 100;

  // TODO: 日付ライブラリに置き換え
  const prevday = options?.before || new Date();
  const nextday = options?.after || new Date();
  prevday.setDate(prevday.getDate() - 10);
  nextday.setDate(nextday.getDate() + 10);

  const query = {
    where: "[channel+timestamp]",
    before: [channel, Number(prevday)],
    after: [channel, Number(nextday)],
  };

  const comments = useLiveQuery(async () => {
    if (channel == null) return;
    const resutl = await db.actions
      .where(query.where)
      .between(query.before, query.after)
      // 後位一致させるため、便利なメソッドが別にあるかも
      .reverse()
      .limit(limit)
      .sortBy("timestamp");
    return resutl;
  }, [channel]);

  return comments || [];
};
