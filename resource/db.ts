import { useCallback, useState } from "react";
import Dexie, { Collection, IndexableType, Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

import { ChatFragment } from "@libs/notification/channelChatMessage";

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
  "2024/05/11": 29, // パラメーターをスキーマ化
};

interface BaseSchema {
  createdAt?: Date;
  updateAt?: Date;
  deletedAt?: Date;
}
export class MySubClassedDexie extends Dexie {
  users!: Table<DbUser>;
  games!: Table<DbGame>;
  broadcastTemplates!: Table<DbBroadcastTemplate>;
  actions!: Table<DbAction>;
  followers!: Table<DbFollowers>;

  channelHistories!: Table<DbChannelHistories>;
  listenerHistories!: Table<DbListenerHistories>;

  settings!: Table<Setting, Setting["id"]>;
  parameters!: Table<DbParametes, DbParametes["type"]>;

  constructor() {
    super("twitch-comments");
    this.version(DB_VERSION["2024/05/11"]).stores({
      users: "id,*userId,displayName,type,broadcasterType",
      actions: "++autoincrementId,id,*channel,messageType,*userId,*timestamp,[channel+timestamp]",
      followers: "++id,channelId,userId,[channelId+userId],createdAt,[channelId+createdAt]",
      channelHistories: "++id,channelId,type,categoryId,timestamp,[channelId+timestamp]",
      listenerHistories: "++id,channelId,userId,[channelId+timestamp]",
      games: "id,igdb_id,name",
      broadcastTemplates: "++id,channelId,gameId,*tags,favorite",
      parameters: "type",
      settings: "id",
    });
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
) => {
  const [page, setPage] = useState(pagintaiton.pageNo);
  const p = useLiveQuery(async () => {
    setPage(0);
    return dbPagination(target);
  }, [target]);

  const value = useLiveQuery(() => {
    if (p == null) return;
    return p({
      pageNo: page,
      pageSize: pagintaiton.pageSize,
    });
  }, [p, page, pagintaiton.pageSize]);

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
  | AbstractParameter<"me", DbUser["id"]>
  | AbstractParameter<
      "live",
      {
        isLive: boolean;
        viewCount: number;
        startedAt: Date;
      }
    >
  | AbstractParameter<
      "chatters",
      {
        users: DbUser["id"][];
        total: number;
      }
    >;

export interface DbListenerHistories {
  id?: number;
  channelId: DbUser["id"];
  userId: DbUser["id"];
  timestamp: Date;
  score: number; // 1 - 0
}
export interface DbChannelHistories extends BaseSchema {
  id?: number;
  channelId: DbUser["id"];
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

export type DbAction = DbComment | DbReward | DbAutomaticReward;

export interface DbBaseAction extends BaseSchema {
  autoincrementId?: number;
  id: string;
  channel: string;
  userId: string | null;
  timestamp?: number; // unix time
  bits?: string;
  rowdata: any; // JSON.stringfy
}
export interface DbComment extends DbBaseAction {
  messageType: "chat";
  message: string;
  fragments: ChatFragment[];
}

export interface DbReward extends DbBaseAction {
  messageType: "reward";
  rewardId: string;
  userTitle: string;
  userInput: string;
}

export interface DbBroadcastTemplate extends BaseSchema {
  id?: number;
  channelId?: DbUser["id"];

  gameId?: string;
  broadcastTitle: string;

  language: string;
  tags: string[];
  classificationLabels: string[];
  isBrandedContent: boolean;

  favorite?: boolean;
}

export interface DbAutomaticReward extends DbBaseAction {
  messageType: "atutomatic-reward";
  rewardId: string;
  userTitle: string;
  userInput: string;
}

export interface Config {
  channelId: DbUser["id"];
  followerUpdateInterval: number;
}

export interface DbUser extends BaseSchema {
  id: string;
  displayName: string;
  login: string;
  type: string;
  broadcasterType: string;
  description: string;
  profileImageUrl: string;
  offlineImageUrl: string;
  metaComment?: string;
  isSpam?: boolean;
  rowData: string;
}

export interface DbGame extends BaseSchema {
  id: string;
  name: string;
  box_art_url: string;
  igdb_id: string;
}

export interface DbFollowers extends BaseSchema {
  id?: number;
  channelId: DbUser["id"];
  userId: DbUser["id"];
  followedAt: Date;
}

export const db = new MySubClassedDexie();
