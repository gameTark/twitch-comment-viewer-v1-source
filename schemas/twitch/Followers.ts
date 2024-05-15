import * as z from "zod";

import { DBBaseSchema } from "./BaseSchema";
import { DBUserId } from "./User";

export const DBFollowerIndex =
  "++id,channelId,userId,[channelId+userId],createdAt,[channelId+createdAt]";
export const DBFollowerSchema = z
  .object({
    id: z.number().optional(),
    channelId: DBUserId,
    userId: DBUserId,
    followedAt: z.date(),
  })
  .and(DBBaseSchema);

export type DBFollower = z.infer<typeof DBFollowerSchema>;
