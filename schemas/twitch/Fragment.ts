import * as z from "zod";

import { DBUserId } from "./User";

const Mention = z.object({
  user_id: DBUserId,
  user_login: z.string(),
  user_name: z.string(),
});
const Cheermote = z.object({
  prefix: z.string(),
  bits: z.number(),
  tier: z.number(),
});
const Emote = z.object({
  id: z.string(),
  emote_set_id: z.string(),
  owner_id: z.string(),
  format: z.string().array(),
});
const TextFragment = z.object({
  type: z.enum(["text"]),
  text: z.string(),
  cheermote: Cheermote.optional(),
  emote: z.null(),
  mention: z.null(),
});
const MentionFragment = z.object({
  type: z.enum(["mention"]),
  text: z.string(),
  cheermote: Cheermote.optional(),
  emote: z.null(),
  mention: Mention,
});
const EmoteFragment = z.object({
  type: z.enum(["emote"]),
  text: z.string(),
  cheermote: Cheermote.optional(),
  emote: Emote,
  mention: z.null(),
});

export const FragmentSchema = TextFragment.or(MentionFragment).or(EmoteFragment);
export type Fragment = z.infer<typeof FragmentSchema>;
