import { DBAction } from "@schemas/twitch/Actions";
import { DBUser } from "@schemas/twitch/User";
import dayjs from "dayjs";
import { Collection } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

import { filter } from "@libs/types";

import { db, dbPagination } from "../resource/db";
import { getUsers } from "../resource/twitchWithDb";

export const useGetAllComments = () => {
  const me = useLiveQuery(() => db.getMe(), []);
  const comments = useLiveQuery(async () => {
    if (me?.login == null) return;
    const resutl = await db.actions.toArray();
    // 後位一致させるため、便利なメソッドが別にあるかも
    return resutl.reverse();
  }, [me]);

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

type ActionType =
  | {
      type: "timestamp";
      from?: Date;
      to?: Date;
      limit?: number;
    }
  | {
      type: "userId";
      userId: DBUser["id"];
      limit?: number;
    };

export const getActions = (props: ActionType) => {
  switch (props.type) {
    case "timestamp": {
      const between = {
        from: Number(props.from || dayjs(new Date()).subtract(10, "day").toDate()),
        to: Number(props.to || dayjs(new Date()).add(10, "day").toDate()),
      };
      const query = {
        where: "timestamp",
        from: between.from,
        to: between.to,
      };
      const result = db.actions.where(query.where).between(query.from, query.to);
      if (props.limit == null) return result;
      return result.limit(props.limit);
    }
    case "userId": {
      const result = db.actions.where("userId").equals(props.userId).reverse();
      if (props.limit == null) return result;
      return result.limit(props.limit);
    }
    default:
      throw new Error("");
  }
};
