import * as z from "zod";

import { DBBaseSchema } from "./BaseSchema";

export const DBUserIndex = "id,*userId,displayName,type,broadcasterType";
export const DBUserId = z.string();
export const DBUserSchema = z
  .object({
    id: DBUserId,
    displayName: z.string().optional(),
    login: z.string(),
    type: z.string().optional(),
    broadcasterType: z.string().optional(),
    description: z.string().optional(),
    profileImageUrl: z.string().optional(),
    offlineImageUrl: z.string().optional(),
    metaComment: z.string().optional(),
    isSpam: z.boolean().optional().default(false),
    rowData: z.string().optional(),
  })
  .and(DBBaseSchema);
export type DBUser = z.infer<typeof DBUserSchema>;
