import * as z from "zod";

import { DBBaseSchema } from "./BaseSchema";

export const DBBroadcastIndex = "++id,channelId,gameId,*tags,favorite";
export const DBBroadcastSchema = z
  .object({
    id: z.number().optional(),
    channelId: z.string().optional(),

    gameId: z.string().optional(),
    broadcastTitle: z.string().max(140, "最大140文字まで入力可能です。").default(""),

    language: z.string(),
    tags: z.string().array().max(25, "最大のタグ数は25件までです。").default([]),
    classificationLabels: z.string().array().default([]),
    isBrandedContent: z.boolean().default(false),

    favorite: z.boolean().optional().default(false),
  })
  .and(DBBaseSchema);
export type DBBroadcast = z.infer<typeof DBBroadcastSchema>;
