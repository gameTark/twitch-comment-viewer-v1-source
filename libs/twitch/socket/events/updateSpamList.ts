import { db } from "@resource/db";
import { isTargetDateAgo } from "@libs/utils";

const fetchBotList = async () => {
  interface Bot {
    bots: [string, number, number][];
    _total: number;
  }
  try {
    const res = await fetch("https://api.twitchinsights.net/v1/bots/all", {
      method: "GET",
    });
    const value = await res.json();
    return value as Bot;
  } catch {
    return {
      bots: [],
      _total: 0,
    };
  }
};
const DB_SPAM_SETTING = "SPAM_UPDATED_AT";
export const updateSpamList = async () => {
  const updateAt = await db.settings.get(DB_SPAM_SETTING);
  if (updateAt?.value != null) {
    // 今日より7日後より前の場合は更新しない
    const isPast = isTargetDateAgo({
      target: updateAt.value,
      num: 7,
      ago: "day",
    });
    if (!isPast) return;
  }

  const data = await fetchBotList();
  db.settings.put({
    id: DB_SPAM_SETTING,
    value: new Date().toISOString(),
  });
  db.spam.bulkPut(data.bots.map((val) => ({ login: val[0] })));
};
