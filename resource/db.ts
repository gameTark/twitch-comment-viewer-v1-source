import { DependencyList, useCallback, useEffect, useState } from "react";
import { DBAction, DBActionIndex } from "@schemas/twitch/Actions";
import { DBGame, DBGameIndex } from "@schemas/twitch/Game";
import { DBUser, DBUserIndex } from "@schemas/twitch/User";
import Dexie, { Collection, IndexableType, Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

const DB_VERSION = {
  "2024/04/03.1": 14, // followersのcreatedAtにindexを追加
  "2024/04/10": 16, // followersのcreatedAtにindexを追加
  "2024/04/20": 17, // コメントの主キーをAutoincrementに変更 -> IndexedDBは主キーでソートされているため
  "2024/04/20.1": 18, // コメントの主キーをAutoincrementに変更 -> IndexedDBは主キーでソートされているため
  "2024/05/05": 21, // game
  "2024/05/08": 22, // game
  "2024/05/08.1": 23, // game
  "2024/05/09": 24, // game
  "2024/05/10": 26, // game
  "2024/05/10.1": 28,
  "2024/05/11": 30, // パラメーターをスキーマ化
};

export interface BaseSchema {
  createdAt?: Date;
  updateAt?: Date;
  deletedAt?: Date;
}
export class MySubClassedDexie extends Dexie {
  users!: Table<DBUser>;
  games!: Table<DBGame>;
  actions!: Table<DBAction>;

  broadcastTemplates!: Table<DbBroadcastTemplate>;
  followers!: Table<DbFollowers>;

  channelHistories!: Table<DbChannelHistories>;
  listenerHistories!: Table<DbListenerHistories>;

  settings!: Table<Setting, Setting["id"]>;
  parameters!: Table<DbParametes, DbParametes["type"]>;

  spam!: Table<Spam, Spam["login"]>;

  constructor() {
    super("twitch-comments");
    this.version(DB_VERSION["2024/05/11"]).stores({
      users: DBUserIndex,
      games: DBGameIndex,
      actions: DBActionIndex,
      followers: "++id,channelId,userId,[channelId+userId],createdAt,[channelId+createdAt]",
      channelHistories: "++id,channelId,type,categoryId,timestamp,[channelId+timestamp]",
      listenerHistories: "++id,channelId,userId,[channelId+timestamp]",
      broadcastTemplates: "++id,channelId,gameId,*tags,favorite",
      parameters: "type",
      spam: "login",
      settings: "id",
    });
  }
  async getMe() {
    const typeValue = await this.parameters.get("me");
    if (typeValue?.type !== "me") return null;
    return typeValue.value || null;
  }
  async getLive() {
    const typeValue = await this.parameters.get("live");
    if (typeValue?.type !== "live") return null;
    return typeValue.value || null;
  }
  async getChatters() {
    const typeValue = await this.parameters.get("chatters");
    if (typeValue?.type !== "chatters") return null;
    return typeValue.value || null;
  }
}
export const dbPagination = async <Type>(
  target: Collection<Type, IndexableType> | Table<Type, IndexableType>,
) => {
  const count = await target.count();
  return async (props: {
    pageNo: number;
    pageSize: number;
  }): Promise<{
    target: Type[];
    page: number;
    count: number;
    maxPage: number;
    hasPrev: boolean;
    hasNext: boolean;
  }> => {
    const value = await target
      .offset(props.pageNo * props.pageSize)
      .limit(props.pageSize)
      .toArray();
    return {
      target: value,
      count: count,
      page: props.pageNo + 1,
      maxPage: Math.ceil(count / props.pageSize),
      hasPrev: props.pageNo >= 1,
      hasNext: props.pageNo * props.pageSize < count - props.pageSize,
    };
  };
};
export const useDbPagination = <Type>(
  target: Collection<Type, IndexableType> | Table<Type, IndexableType>,
  pagintaiton: {
    pageNo: number;
    pageSize: number;
  },
  deps: any[],
) => {
  const [page, setPage] = useState(pagintaiton.pageNo);
  useEffect(() => {
    setPage(0);
  }, deps);
  const value = useLiveQuery(async () => {
    const p = await dbPagination(target);
    return p({
      pageNo: page,
      pageSize: pagintaiton.pageSize,
    });
  }, [page, pagintaiton.pageSize, ...deps]);

  const next = useCallback(() => {
    setPage((v) => Math.max(v + 1, 0));
  }, []);

  const prev = useCallback(() => {
    setPage((v) => Math.max(v - 1, 0));
  }, []);
  return {
    value,
    next,
    prev,
  };
};

interface AbstractParameter<Type, Value> {
  type: Type;
  value: Value;
}
export type DbParametes =
  | AbstractParameter<
      "me",
      {
        id: DBUser["id"];
        login: DBUser["login"];
      }
    >
  | AbstractParameter<
      "live",
      {
        isLive: boolean;
        viewCount: number;
        startedAt: Date;
      } | null
    >
  | AbstractParameter<
      "chatters",
      {
        users: DBUser["id"][];
        total: number;
      }
    >;

export interface DbListenerHistories {
  id?: number;
  channelId: DBUser["id"];
  userId: DBUser["id"];
  timestamp: Date;
  score: number; // 1 - 0
}
export interface DbChannelHistories extends BaseSchema {
  id?: number;
  channelId: DBUser["id"];
  type: "update" | "online" | "offline";
  broadcastTitle: string;
  categoryId: string;
  categoryName: string;
  language: string;
  timestamp: Date;
  rowdata: any;
}

export interface Setting {
  id: string;
  value: string;
}
export interface Spam {
  login: string;
}

export interface DbBroadcastTemplate extends BaseSchema {
  id?: number;
  channelId?: DBUser["id"];

  gameId?: string;
  broadcastTitle: string;

  language: string;
  tags: string[];
  classificationLabels: string[];
  isBrandedContent: boolean;

  favorite?: boolean;
}

export interface Config {
  channelId: DBUser["id"];
  followerUpdateInterval: number;
}

export interface DbGame extends BaseSchema {
  id: string;
  name: string;
  box_art_url: string;
  igdb_id: string;
}

export interface DbFollowers extends BaseSchema {
  id?: number;
  channelId: DBUser["id"];
  userId: DBUser["id"];
  followedAt: Date;
}

export const db = new MySubClassedDexie();
