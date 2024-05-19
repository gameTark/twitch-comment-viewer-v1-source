import * as z from "zod";

import { FetchChannelInfoResult } from "@libs/twitch";

import { DBBaseSchema } from "./BaseSchema";

export const DBBroadcastIndex = "++id,channelId,gameId,*tags,favorite";
export const DBBroadcastSchema = z
  .object({
    id: z.number().optional(),
    channelId: z.string().optional(),

    gameId: z.string().optional(),
    broadcastTitle: z.string().max(140, "最大140文字まで入力可能です。").default(""),

    language: z.string(),
    tags: z.array(z.string()).max(25, "最大のタグ数は25件までです。").default([]),
    classificationLabels: z.string().array().default([]),
    isBrandedContent: z.boolean().default(false),

    favorite: z.boolean().optional().default(false),
  })
  .and(DBBaseSchema);

export type DBBroadcast = z.infer<typeof DBBroadcastSchema>;

export const DBBroadcastParseByAPI = (...parameters: FetchChannelInfoResult["data"]) => {
  return parameters.map((val): DBBroadcast => {
    return DBBroadcastSchema.parse({
      channelId: val.broadcaster_id,
      gameId: val.game_id,
      broadcastTitle: val.title,
      language: val.broadcaster_language,
      tags: val.tags,
      classificationLabels: val.content_classification_labels,
      isBrandedContent: val.is_branded_content,
      favorite: false,
    });
  });
};
