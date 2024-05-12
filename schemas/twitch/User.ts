import * as z from "zod";

import { DBBaseSchema } from "./BaseSchema";

export const DBUserIndex = "id,*userId,displayName,type,broadcasterType";
export const DBUserId = z.string();
export const DBUserSchema = z
  .object({
    id: DBUserId,
    displayName: z.string(),
    login: z.string(),
    type: z.string(),
    broadcasterType: z.string(),
    description: z.string(),
    profileImageUrl: z.string().url(),
    offlineImageUrl: z.string().url(),
    metaComment: z.string(),
    isSpam: z.boolean().optional().default(false),
    rowData: z.string().optional(),
  })
  .and(DBBaseSchema);
export type DBUser = z.infer<typeof DBUserSchema>;
