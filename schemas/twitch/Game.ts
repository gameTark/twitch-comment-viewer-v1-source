import * as z from "zod";

import { DBBaseSchema } from "./BaseSchema";

export const DBGameIndex = "id,igdb_id,name";
export const DBGameSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    box_art_url: z.string().url(),
    igdb_id: z.string(),
  })
  .and(DBBaseSchema);

export type DBGame = z.infer<typeof DBGameSchema>;
