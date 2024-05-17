"use client";

import React, { useState } from "react";
import { DBBroadcast, DBBroadcastSchema } from "@schemas/twitch/Broadcast";
import clsx from "clsx";
import { useLiveQuery } from "dexie-react-hooks";

import { getBroadcastTemplates } from "@resource/twitchWithDb";
import { filter } from "@libs/types";
import { useInput } from "@libs/uses";

import { Scroll } from "@components/commons/PerfectScrollbar";
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
      <Broadcast.editor.BroadcastFormProvider onSubmit={handleSubmit} className="w-full h-full">
        <Scroll className="@container relative flex flex-col gap-4 px-4 h-full">
          <div className="inline-flex flex-col @[600px]:flex-row gap-4">
            <p className="w-48">配信タイトル</p>
            <Broadcast.editor.Title />
          </div>
          <div className="inline-flex flex-col @[600px]:flex-row gap-4">
            <p className="w-48">対象ゲーム</p>
            <Broadcast.editor.Game />
          </div>
          <div className="inline-flex flex-col @[600px]:flex-row gap-4">
            <p className="w-48">タグ</p>
            <Broadcast.editor.Tags />
          </div>

          <div className="inline-flex flex-col @[600px]:flex-row gap-4">
            <p className="w-48">配信言語</p>
            <Broadcast.editor.Language />
          </div>
          <div className="inline-flex gap-4 my-4 @[600px]:my-0">
            <p className="w-48">ブランドコンテンツ</p>
            <Broadcast.editor.BrandedContents />
          </div>

          <div className="inline-flex gap-2 items-end justify-end sticky bottom-0 bg-base-100 py-4 grow">
            <button className="btn btn-error btn-outline" type="button" onClick={props.onCancel}>
              {props.canncelLabel || "キャンセル"}
            </button>
            <button className="btn btn-success btn-outline">{props.commmitLabel || "完了"}</button>
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
                <Game.Image width={150} className=" rounded-box aspect-square object-cover" />
                <div className="flex flex-col gap-4">
                  <h2>
                    <Game.Name className="text-md font-extralight" />
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
        className="flex gap-2 items-center cursor-pointer px-5 py-4 hover:bg-base-200 rounded-box"
        onClick={() => handleClick("open")}>
        <div>
          <Game.Image width={60} className=" rounded-box aspect-square object-cover" />
        </div>
        <div className="flex flex-col grow">
          <Game.Name className="text-md font-extralight" />
          <Broadcast.Title className="text-lg" />
        </div>
        <div>
          <Broadcast.TagBadge className="gap-2 flex flex-wrap justify-end" />
        </div>
      </li>
    </>
  );
};
export const Events = () => {
  const createNewTemplate = Broadcast.uses.useCreate({ isNew: true });
  return (
    <div className="inline-flex items-center gap-3">
      <button className="btn btn-outline btn-success btn-xs" onClick={createNewTemplate}>
        過去の配信から作成
      </button>
      <button className="btn btn-outline btn-success btn-xs" onClick={createNewTemplate}>
        新規追加
      </button>
    </div>
  );
};
// TODO: editのページ化
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

      <Scroll
        className={clsx(
          "dropdown-content z-10 bg-base-100 shadow-2xl w-full h-max max-h-96 border-x rounded-b-box",
          { "border-b": !(data == null || data.length == 0) },
        )}></Scroll>
      {data == null || data.length == 0 ? null : (
        <ul className="flex flex-wrap gap-2 flex-col p-2">
          {data.map((val) => (
            <Broadcast.Provider data={val} key={val.id}>
              <Game.Provider id={val.gameId}>
                <SearchItem />
              </Game.Provider>
            </Broadcast.Provider>
          ))}
        </ul>
      )}
    </div>
  );
};