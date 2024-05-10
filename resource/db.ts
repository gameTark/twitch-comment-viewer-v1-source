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
};

// TODO: 永続化を行う https://gist.github.com/loilo/ed43739361ec718129a15ae5d531095b

interface BaseSchema {
  createdAt?: Date;
  updateAt?: Date;
  deletedAt?: Date;
}

// followers
/**
 * broadcasts
 * 開始時間と終了時間が取れない可能性がある（どうしたいい？）
 * -> videoAPIとかで取れるかも？
 * -> リアタイでとる必要ある？ なさそう
 * 最初に取るメソッド等を探すと良さそう。
 * ビデオ消した場合とか考え辛いかも
 *
 * 初回に情報取得した後
 * 以後ソケットで更新 https://dev.twitch.tv/docs/api/reference/#get-channel-information
 * 定期的にポーリング（１０分おきぐらいで良さそう） https://dev.twitch.tv/docs/api/reference/#get-channel-followers
 *      -> データは残しておきたい
 * 定期的にポーリング　https://dev.twitch.tv/docs/api/reference/#get-chatters
 *      -> データは残しておきたい
 *
 * ユーザーチャットカラーを取得できるみたい。https://dev.twitch.tv/docs/api/reference/#get-user-chat-color
 * ゲームラベルの取得 https://dev.twitch.tv/docs/api/reference/#get-content-classification-labels
 *      DBに保存しておきたい、変わらないから
 *      保存して検索
 */

/**

主キーの構文
++キーパス	自動インクリメント主キー	主キーが自動的にインクリメントされることを意味します。主キーは常に一意である必要があります。
++	非表示の自動インクリメントされた主キー	主キーは自動インクリメントされますが、オブジェクトには表示されないことを意味します。
キーパス	主キーを自動インクリメントしない	主キーはどのようなタイプでもよく、自分で指定する必要があることを意味します
（空白）	隠された主キー	最初のエントリを空白のままにすると、主キーは非表示になり、自動インクリメントされません。

インデックスの構文
キーパス		keyPath がインデックス化されていることを意味します
&キーパス	個性的	keyPath にはインデックスが付けられており、キーは一意である必要があることを意味します
*キーパス	多値	キーが配列の場合、各配列値がオブジェクトのキーとしてみなされることを意味します。
[キーパス1+キーパス2]	コンパウンド	keyPath1 と keyPath2 の複合インデックスの定義

example
db.version(1).stores({
    friends: '++id,name,shoeSize', // Primary Key is auto-incremented (++id)
    pets: 'id, name, kind',        // Primary Key is not auto-incremented (id)
    cars: '++, name',              // Primary Key auto-incremented but not inbound
    enemies: ',name,*weaknesses',  // Primary key is neither inbound nor auto-incr
                                   // 'weaknesses' contains an array of keys (*)
    users: 'meta.ssn, addr.city',  // Dotted keypath refers to nested property 
    people: '[name+ssn], &ssn'     // Compound primary key. Unique index ssn
});

 */

// https://dexie.org/docs/Version/Version.stores()
// TODO: DbCommentをDbActionへ変更する
export class MySubClassedDexie extends Dexie {
  users!: Table<DbUser>;
  games!: Table<DbGame>;
  broadcastTemplates!: Table<DbBroadcastTemplate>;
  actions!: Table<DbAction>;
  followers!: Table<DbFollowers>;

  channelHistories!: Table<DbChannelHistories>;
  listenerHistories!: Table<DbListenerHistories>;

  settings!: Table<Setting, Setting["id"]>;

  constructor() {
    super("twitch-comments");
    this.version(DB_VERSION["2024/05/10.1"]).stores({
      users: "id,*userId,displayName,type,broadcasterType",
      actions: "++autoincrementId,id,*channel,messageType,*userId,*timestamp,[channel+timestamp]",
      followers: "++id,channelId,userId,[channelId+userId],createdAt,[channelId+createdAt]",
      channelHistories: "++id,channelId,type,categoryId,timestamp,[channelId+timestamp]",
      listenerHistories: "++id,channelId,userId,[channelId+timestamp]",
      games: "id,igdb_id,name",
      broadcastTemplates: "++id,channelId,gameId,*tags,favorite",
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

// TODO: 1時間おきに更新させたい
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
  categoryId: string; // DbGameをそのうち作成する。
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
// TODO: migraton https://dexie.org/docs/Tutorial/Migrating-existing-DB-to-Dexie

// https://dexie.org/docs/Version/Version.upgrade()
export const databaseMigration = async () => {
  console.log("migration");
  db.version(DB_VERSION["2024/05/10.1"]).upgrade((trans) => {
    return trans.table("followers").clear();
  });
  return true;
};
databaseMigration().then(() => {
  console.log("migrated");
});
