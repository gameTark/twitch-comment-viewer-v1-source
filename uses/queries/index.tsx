import { useCallback } from "react";
import { DBBroadcastParseByAPI } from "@schemas/twitch/Broadcast";
import { useQuery } from "@tanstack/react-query";

import { db, DbBroadcastTemplate } from "@resource/db";
import { fetchChannelInfo, fetchChannelInfoPatch } from "@libs/twitch";

export const useMeQuery = () =>
  useQuery({
    queryKey: ["me_query"],
    queryFn: async () => {
      return await db.getMe();
    },
  });

export const useBroadcastInformationQuery = () => {
  const me = useMeQuery();
  return useQuery({
    queryKey: ["information", me.data?.id],
    queryFn: async () => {
      if (me.data?.id == null) return;
      const data = await fetchChannelInfo({ broadcaster_id: me.data?.id });
      return DBBroadcastParseByAPI(...data.data)[0];
    },
    enabled: me.data?.id != null,
  });
};
export const useBroadcastInformationPatch = () => {
  const me = useMeQuery();
  return useCallback(
    async (params: DbBroadcastTemplate) => {
      if (me.data?.id == null) return;
      return await fetchChannelInfoPatch({
        id: {
          broadcaster_id: me.data.id,
        },
        patch: {
          broadcaster_language: params.language,
          content_classification_labels: params.classificationLabels,
          tags: params.tags,
          title: params.broadcastTitle,
          game_id: params.gameId,
          is_branded_content: params.isBrandedContent,
        },
      });
    },
    [me.data?.id],
  );
};
