"use client";

import React, { useRef, useState } from "react";
import { DBBroadcast, DBBroadcastSchema } from "@schemas/twitch/Broadcast";
import clsx from "clsx";
import { useLiveQuery } from "dexie-react-hooks";

import { db, useDbPagination } from "@resource/db";
import { getBroadcastTemplates } from "@resource/twitchWithDb";
import { filter } from "@libs/types";
import { useInput } from "@libs/uses";

import { Scroll } from "@components/commons/PerfectScrollbar";
import { ICONS } from "@components/icons";
import { useSearchBroadcastTemplate } from "@components/pages/gamePage";
import { Broadcast } from "./withContext/Broadcast";
import { Game } from "./withContext/Game";

const Card = () => {
  const baseClass = clsx(
    "inline-block h-full w-full font-black border-[2vw] border-neutral blur-3xl",
  );
  const textBaseClass = clsx(
    "opacity-40 hover:opacity-100 transition-opacity drop-shadow-sm text-outline",
  );
  return (
    <div className="relative z-0 w-full indicator">
      <div className="indicator-item z-20">
        <Broadcast.Favorite />
      </div>

      <div className="z-10 absolute top-0 w-full h-full opacity-0 hover:opacity-100 transition-opacity overflow-hidden rounded-box backdrop-blur-sm">
        <div className="w-full h-full grid grid-cols-2 grid-rows-2 font-bold absolute top-0">
          <div className={clsx("bg-success", baseClass)} />
          <div className={clsx("bg-accent", baseClass)} />
          <div className={clsx("bg-info", baseClass)} />
          <div className={clsx("bg-error", baseClass)} />
        </div>

        <div className="z-20 absolute top-0 w-full h-full grid grid-cols-2 grid-rows-2 font-bold text-2xl">
          <Broadcast.Apply className={clsx("text-success", textBaseClass)} />
          <Broadcast.Copy className={clsx("text-accent", textBaseClass)} />
          <Broadcast.Edit className={clsx("text-info", textBaseClass)} />
          <Broadcast.Delete className={clsx("text-error", textBaseClass)} />
        </div>
      </div>

      <div className="card w-full bg-base-100 shadow-xl image-full z-0 aspect-square h-full">
        <figure>
          <Game.Image className=" object-cover" width={500} />
        </figure>
        <div className="card-body">
          <h2 className="card-title w-full">
            <Game.Name className=" break-all line-clamp-2 w-full" />
          </h2>
          <p>
            <Broadcast.Title />
          </p>
          <Broadcast.TagBadge className="flex justify-end gap-2 flex-wrap" />
        </div>
      </div>
    </div>
  );
};
export function FaboriteBroadcastItemList() {
  const favoriteItems = useLiveQuery(async () => {
    return (await getBroadcastTemplates({ type: "favorite", value: true })).filter(filter.notNull);
  }, []);

  return (
    <div className="flex items-stretch flex-wrap -m-3 h-full">
      {favoriteItems?.map((val) => {
        return (
          <div className="w-1/4 flex p-3 min-w-60 max-w-96 h-max" key={val.id}>
            <Broadcast.Provider data={val}>
              <Game.Provider id={val.gameId}>
                <Card />
              </Game.Provider>
            </Broadcast.Provider>
          </div>
        );
      })}
    </div>
  );
}
export function BroadcastInformation() {
  const allItems = useLiveQuery(async () => {
    return (await getBroadcastTemplates()).filter(filter.notNull);
  }, []);
  return (
    <div className="p-10 h-fit flex flex-col gap-5 w-full">
      <h2 className="heading-2">お気に入り</h2>
      <div className="flex items-stretch flex-wrap -m-3">
        <FaboriteBroadcastItemList />
      </div>
      <h2 className="heading-2">全件</h2>
      <div className="flex items-stretch flex-wrap -m-3">
        {allItems?.map((val) => {
          return (
            <div className=" w-1/5 flex p-3 min-w-60 max-w-96" key={val.id}>
              <Broadcast.Provider data={val}>
                <Game.Provider id={val.gameId}>
                  <Card />
                </Game.Provider>
              </Broadcast.Provider>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type BroadcastProps = {
  value?: DBBroadcast;
  commmitLabel?: string;
  canncelLabel?: string;
  onCommit?: (e: DBBroadcast) => void;
  onCancel?: () => void;
};

/**
@media (600px <= width < 800px) {
  550
}
 */
export default function BroadcastEditor(props: BroadcastProps) {
  const handleSubmit = (value: Partial<DBBroadcast>) => {
    const result = DBBroadcastSchema.parse(value);
    props.onCommit && props.onCommit(result);
  };
  return (
    <Broadcast.Provider data={props.value}>
      <Broadcast.editor.BroadcastFormProvider onSubmit={handleSubmit}>
        <Scroll className="@container relative">
          <div className="flex flex-col gap-4 h-full">
            <div className="inline-flex flex-col @[600px]:flex-row gap-4">
              <p className="w-48 font-bold pt-3 @[600px]:pt-0">配信タイトル</p>
              <Broadcast.editor.Title />
            </div>
            <div className="inline-flex flex-col @[600px]:flex-row gap-4">
              <p className="w-48 font-bold pt-3 @[600px]:pt-0">対象ゲーム</p>
              <Broadcast.editor.Game />
            </div>
            <div className="inline-flex flex-col @[600px]:flex-row gap-4">
              <p className="w-48 font-bold pt-3 @[600px]:pt-0">タグ</p>
              <Broadcast.editor.Tags />
            </div>

            <div className="inline-flex flex-col @[600px]:flex-row gap-4">
              <p className="w-48 font-bold pt-3 @[600px]:pt-0">配信言語</p>
              <Broadcast.editor.Language />
            </div>
            <div className="inline-flex gap-4 my-4 @[600px]:my-0">
              <p className="w-48 font-bold">ブランドコンテンツ</p>
              <Broadcast.editor.BrandedContents />
            </div>

            <div className="inline-flex gap-2 items-end justify-end sticky bottom-0 bg-base-100 py-4 grow">
              <button className="btn btn-error btn-outline" type="button" onClick={props.onCancel}>
                {props.canncelLabel || "キャンセル"}
              </button>
              <button className="btn btn-success btn-outline">
                {props.commmitLabel || "完了"}
              </button>
            </div>
          </div>
        </Scroll>
      </Broadcast.editor.BroadcastFormProvider>
    </Broadcast.Provider>
  );
}

const SearchItem = () => {
  const [clicked, handleClick] = useState("close");
  return (
    <>
      {clicked === "open" ? (
        <dialog className="modal modal-open">
          <div className=" modal-box w-full h-max">
            <div className="flex flex-col gap-4">
              <div className="flex gap-6">
                <Game.Image width={150} className="rounded-box aspect-square object-cover" />
                <div className="flex flex-col gap-4">
                  <h2>
                    <Game.Name className="text-md font-extralight line-clamp-1" />
                  </h2>
                  <Broadcast.Title className="text-lg" />
                  <Broadcast.Language />
                  <Broadcast.TagBadge className="gap-2 flex" />
                  <Broadcast.CreatedAt />
                </div>
              </div>

              <div className="grid grid-cols-2 grid-rows-2 gap-2">
                <Broadcast.Apply className="btn btn-square w-full btn-success btn-outline" />
                <Broadcast.Copy className="btn btn-square w-full btn-accent  btn-outline" />
                <Broadcast.Edit className="btn btn-square w-full btn-info  btn-outline" />
                <Broadcast.Delete className="btn btn-square w-full btn-error btn-outline" />
              </div>
            </div>
          </div>

          <label className="modal-backdrop" onClick={() => handleClick("close")} />
        </dialog>
      ) : null}
      <li
        className="flex gap-2 items-center cursor-pointer p-2 hover:bg-base-200 rounded-box"
        onClick={() => handleClick("open")}>
        <Game.Image width={60} className=" rounded-box aspect-square object-cover" />

        <div className="flex flex-col grow">
          <Game.Name className="text-md font-extralight line-clamp-1" />
          <Broadcast.Title className="text-lg" />
        </div>
        <div>
          <Broadcast.TagBadge className="gap-2 flex flex-wrap justify-end" />
        </div>
      </li>
    </>
  );
};
const OldBroadcast = () => {
  const create = Broadcast.uses.useCreate({
    isHistory: true,
  });
  return (
    <div
      className="grid grid-cols-[max-content_minmax(0,1fr)] grid-rows-[max-content_1fr_max-content] gap-y-2 gap-x-5 cursor-pointer hover:bg-base-300 py-2 px-2 rounded-box select-none"
      onClick={create}>
      <p className="col-start-2">
        <Game.Name className="break-all line-clamp-1 w-full " />
      </p>
      <Game.Image
        width={100}
        className="row-span-3 col-start-1 row-start-1 aspect-square rounded-box object-cover"
      />
      <p className="col-start-2">
        <Broadcast.Title />
      </p>
      <p className="col-start-2 text-right text-caption opacity-60">
        配信日 <Broadcast.CreatedAt format="YYYY/MM/DD" />
      </p>
    </div>
  );
};
export const Events = () => {
  const createNewTemplate = Broadcast.uses.useCreate({ isNew: true });
  const refModal = useRef<HTMLDialogElement>(null);
  const channelHistories = useDbPagination(
    db.channelHistories,
    {
      pageNo: 0,
      pageSize: 10,
    },
    [],
  );
  return (
    <div className="inline-flex items-center gap-3">
      <button
        className="btn btn-outline btn-success btn-xs"
        onClick={() => refModal.current?.showModal()}>
        過去の配信から作成
      </button>
      <button className="btn btn-outline btn-success btn-xs" onClick={createNewTemplate}>
        新規追加
      </button>

      <dialog className="modal" ref={refModal}>
        <div className="modal-box relative h-4/6 flex flex-col gap-5">
          <button
            className=" btn btn-circle btn-sm btn-ghost absolute right-0 top-0 m-3 select-none cursor-pointer"
            onClick={() => refModal.current?.close()}>
            {ICONS.CROSS.MD}
          </button>
          <h3>テンプレートを作成</h3>
          <Scroll className="border pl-1 pr-1 rounded-box rounded-r-none" noPadding>
            <div className="flex flex-col gap-6 py-1">
              {channelHistories.value?.target.map((channelHistory) => {
                return (
                  <Broadcast.Provider
                    key={channelHistory.id}
                    data={{
                      id: channelHistory.id,
                      channelId: channelHistory.channelId,
                      gameId: channelHistory.categoryId,
                      broadcastTitle: channelHistory.broadcastTitle,
                      language: channelHistory.language,
                      tags: [],
                      classificationLabels: [],
                      isBrandedContent: false,
                      createdAt: channelHistory.createdAt,
                    }}>
                    <Broadcast.ApplyGameProvider Provider={Game.Provider}>
                      <OldBroadcast />
                    </Broadcast.ApplyGameProvider>
                  </Broadcast.Provider>
                );
              })}
            </div>
          </Scroll>
        </div>
      </dialog>
    </div>
  );
};

export const Search = () => {
  const [input, onChange] = useInput("");
  const data = useSearchBroadcastTemplate(input);
  return (
    <div
      className={clsx("flex items-center dropdown dropdown-bottom dropdown-hover w-full", {
        "[&>input]:hover:rounded-b-none": !(data == null || data.length == 0),
      })}>
      <input
        className={clsx(
          "input input-bordered input-sm input-ghost grow bg-base-100 text-base-content rounded-box",
          {
            "focus:rounded-b-none": !(data == null || data.length == 0),
          },
        )}
        value={input}
        onChange={onChange}
        placeholder="検索"
      />

      {data == null || data.length == 0 ? null : (
        <Scroll className="dropdown-content z-10 bg-base-100 shadow-2xl w-full h-max max-h-96 border-x rounded-b-box border-b rounded-r-none">
          <ul className="flex flex-wrap gap-2 flex-col p-2">
            {data.map((val) => (
              <Broadcast.Provider data={val} key={val.id}>
                <Game.Provider id={val.gameId}>
                  <SearchItem />
                </Game.Provider>
              </Broadcast.Provider>
            ))}
          </ul>
        </Scroll>
      )}
    </div>
  );
};