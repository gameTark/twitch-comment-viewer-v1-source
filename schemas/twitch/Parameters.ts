import * as z from "zod";

import { DBUserId } from "./User";

export const DBGameIndex = "id,igdb_id,name";

export const ChattersShema = z.object({
  type: z.enum(["chatters"]),
  value: z.object({
    users: z.array(DBUserId).default([]),
    total: z.number().optional().default(0),
  }),
});

export const LiveSchema = z.object({
  type: z.enum(["live"]),
  value: z.object({
    isLive: z.boolean().optional().default(false),
    viewCount: z.number().optional().default(0),
    startedAt: z.date().optional().nullable().default(null),
  }),
});

export const MeSchema = z.object({
  type: z.enum(["me"]),
  value: z
    .object({
      id: DBUserId,
      login: z.string(),
    })
    .optional(),
});

export type DBChatters = z.infer<typeof ChattersShema>;
export type DBLive = z.infer<typeof LiveSchema>;
export type DBMe = z.infer<typeof MeSchema>;
export type DBParameter = DBChatters | DBLive | DBMe;
