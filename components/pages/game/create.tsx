"use client";

import React, { Suspense, useCallback } from "react";
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

  const createBroadcastTemplate = useCallback((e: DBBroadcast) => {
    const { id: _id, favorite: _favorite, ...props } = e;
    db.broadcastTemplates.add({
      ...props,
      favorite: false,
    });
    router.push("/games");
  }, []);

  // TODO: 実装が分かりづらいのでreact queryあたりで実装したい
  if (data === null) {
    return <></>;
  }
  return (
    <div className="fixed w-full h-full bg-base-100 z-10">
      <BroadcastEditor value={data} onCancel={cancel} onCommit={createBroadcastTemplate} />
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
