import * as z from "zod";

import { DBBaseSchema } from "./BaseSchema";
import { FragmentSchema } from "./Fragment";
import { DBUserId } from "./User";

export const DBActionIndex =
  "++autoincrementId,id,*channel,messageType,*userId,*timestamp,[channel+timestamp]";

const DBBaseActionSchema = z
  .object({
    autoincrementId: z.number().optional(),
    id: z.string(),
    channel: z.string(),
    userId: DBUserId.nullable().default(null),
    timestamp: z.number().optional(),
    bits: z.string().optional(),
    rowdata: z.string().optional(), // json?
  })
  .and(DBBaseSchema);

export const DBComentSchema = z
  .object({
    messageType: z.enum(["chat"]),
    message: z.string(),
    fragments: FragmentSchema.array(),
  })
  .and(DBBaseActionSchema);

export const DBReward = z
  .object({
    messageType: z.enum(["reward", "atutomatic-reward"]),
    rewardId: z.string(),
    userTitle: z.string(),
    userInput: z.string(),
  })
  .and(DBBaseActionSchema);

export const DBActionSchema = DBComentSchema.or(DBReward);
export type DBAction = z.infer<typeof DBActionSchema>;
export type DBReward = z.infer<typeof DBReward>;
export type DBComment = z.infer<typeof DBComentSchema>;
