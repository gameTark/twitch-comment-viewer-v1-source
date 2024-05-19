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
    if (typeof code !== "string") return null;
    const result = await db.broadcastTemplates.get(Number(code));
    return result;
  }, []);

  const createBroadcastTemplate = useCallback((e: DBBroadcast) => {
    const { id, ...props } = e;
    if (id == null) return;
    db.broadcastTemplates.update(id, props);
    router.push("/games");
  }, []);

  // TODO: 実装が分かりづらいのでreact queryあたりで実装したい
  if (data === null) {
    return <></>;
  }

  return (
    <div className="fixed w-full h-full bg-base-100 z-10 flex justify-center items-center">
      <div className=" min-w-96 w-2/4 border rounded-box p-5 flex flex-col gap-10">
        <h1>編集</h1>
        <BroadcastEditor value={data} onCancel={cancel} onCommit={createBroadcastTemplate} />
      </div>
    </div>
  );
};
export default function EditPage() {
  return (
    <Suspense>
      <Data />
    </Suspense>
  );
}
