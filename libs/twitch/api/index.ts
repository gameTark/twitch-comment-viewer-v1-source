import queryString from "query-string";

import { db } from "@resource/db";

const API_KEY = "of40zatnkd1ftcaqnf92ahqznkg1vn";
const STORAGE_KEY = "twitch_token";
const getTwitchToken = async () => {
  const item = await db.settings.get(STORAGE_KEY);
  if (item == null) throw new Error("twitch token is not found");
  return item.value;
};
export const baseFetch = async (...args: Parameters<typeof fetch>) => {
  const token = await getTwitchToken();
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Client-Id": API_KEY,
    "Content-Type": "application/json",
  };
  const [input, init, ...other] = args;
  return fetch(
    input,
    {
      ...init,
      headers: {
        ...headers,
        ...(init?.headers || {}),
      },
    },
    ...other,
  );
};
