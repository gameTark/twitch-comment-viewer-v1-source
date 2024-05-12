import * as z from "zod";

export const DBBaseSchema = z.object({
  createdAt: z.date().optional().default(new Date()),
  updateAt: z.date().optional().default(new Date()),
  deletedAt: z.date().optional(),
});
