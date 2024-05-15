import * as z from "zod";

import { DBBaseSchema } from "./BaseSchema";
import { DBUserId } from "./User";

export const DBChannelHistoryIndex = "++id,channelId,type,categoryId,timestamp,[channelId+timestamp]";
export const DBChannelHistorySchema = z
  .object({
    id: z.number().optional(),
    channelId: DBUserId,
    tpye: z.enum(["update", "offline", "online"]),
    broadcastTitle: z.string(),
    categoryId: z.string(), // gameId
    categoryName: z.string(),
    language: z.string(),
    timestamp: z.date().default(new Date),
    rowdata: z.string().optional(),
  })
  .and(DBBaseSchema);
export type DBChannelHistory = z.infer<typeof DBChannelHistorySchema>;
