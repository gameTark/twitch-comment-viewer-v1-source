"use client";

import React, { Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DBBroadcast } from "@schemas/twitch/Broadcast";

import { db } from "@resource/db";
import { useAsyncMemo } from "@libs/uses";

import BroadcastEditor from "@components/twitch/Broadcast";

const Data = () => {
  const router = useRouter();
  const cancel = useCallback(() => {
    router.push("/games");
  }, []);
  const params = useSearchParams();

  const data = useAsyncMemo(async () => {
    const code = params.get("templateId");
    if (code == null) return;
    if (typeof code !== "string") return null;
    const result = await db.broadcastTemplates.get(Number(code));
    return result;
  }, []);

  const data2 = useAsyncMemo(async () => {
    const code = params.get("broadcastHistoryId");
    if (code == null) return;
    if (typeof code !== "string") return null;
    const channelHistory = await db.channelHistories.get(Number(code));
    if (channelHistory == null) return;
    const item: DBBroadcast = {
      channelId: channelHistory.channelId,
      gameId: channelHistory.categoryId,
      broadcastTitle: channelHistory.broadcastTitle,
      language: channelHistory.language,
      tags: [],
      classificationLabels: [],
      isBrandedContent: false,
      favorite: false,
      createdAt: channelHistory.createdAt,
      updateAt: new Date(),
    };
    return item;
  }, []);
  const result = data || data2;

  const createBroadcastTemplate = useCallback((e: DBBroadcast) => {
    const { id: _id, favorite: _favorite, ...props } = e;
    db.broadcastTemplates.add({
      ...props,
      favorite: false,
    });
    router.push("/games");
  }, []);

  // TODO: 実装が分かりづらいのでreact queryあたりで実装したい
  if (result === null) {
    return <></>;
  }
  return (
    <div className="fixed w-full h-full bg-base-100 z-10 flex justify-center items-center">
      <div className=" min-w-96 w-2/4 border rounded-box p-5 flex flex-col gap-10">
        <h1>新規作成</h1>
        <BroadcastEditor value={result} onCancel={cancel} onCommit={createBroadcastTemplate} />
      </div>
    </div>
  );
};

export default function CreatePage() {
  return (
    <Suspense>
      <Data />
    </Suspense>
  );
}
