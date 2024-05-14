"use client";

import React, { useState } from "react";
import { DBBroadcast, DBBroadcastSchema } from "@schemas/twitch/Broadcast";
import clsx from "clsx";
import { useLiveQuery } from "dexie-react-hooks";

import { getBroadcastTemplates } from "@resource/twitchWithDb";
import { filter } from "@libs/types";
import { useInput } from "@libs/uses";

import { useSearchBroadcastTemplate } from "@components/pages/gamePage";
import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";
import { Broadcast } from "./withContext/Broadcast";
import { Game } from "./withContext/Game";

const Card = () => {
  return (
    <div className="relative z-0 w-full">
      <div className="absolute top-0 right-0 z-20 mt-2 mr-3">
        <Broadcast.Favorite />
      </div>
      <div className="z-10 absolute top-0 w-full h-full bg-neutral text-neutral-content bg-opacity-80 opacity-0 hover:opacity-100 transition-opacity rounded-box overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-5 h-full w-full p-10">
          <Broadcast.Apply />
          <Broadcast.Copy />
          <Broadcast.Edit />
          <Broadcast.Delete />
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

export function BroadcastInformation() {
  const allItems = useLiveQuery(async () => {
    return (await getBroadcastTemplates()).filter(filter.notNull);
  }, []);
  const favoriteItems = useLiveQuery(async () => {
    return (await getBroadcastTemplates({ type: "favorite", value: true })).filter(filter.notNull);
  }, []);
  return (
    <div className="p-10 h-fit flex flex-col gap-5 w-full">
      <h2 className="heading-2">お気に入り</h2>
      <div className="flex items-stretch flex-wrap -m-3">
        {favoriteItems?.map((val) => {
          return (
            <div className=" w-1/4 flex p-3 min-w-60 max-w-96" key={val.id}>
              <Broadcast.Provider data={val}>
                <Game.Provider id={val.gameId}>
                  <Card />
                </Game.Provider>
              </Broadcast.Provider>
            </div>
          );
        })}
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
export default function BroadcastEditor(props: BroadcastProps) {
  const handleSubmit = (value: Partial<DBBroadcast>) => {
    const result = DBBroadcastSchema.parse(value);
    props.onCommit && props.onCommit(result);
  };
  return (
    <Broadcast.Provider data={props.value}>
      <Broadcast.editor.BroadcastFormProvider onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col gap-5 py-4 px-10">
          <div className="flex">
            <p className="w-48">配信タイトル</p>
            <Broadcast.editor.Title />
          </div>
          <div className="flex">
            <p className="w-48">対象ゲーム</p>
            <Broadcast.editor.Game />
          </div>
          <div className="flex">
            <p className="w-48">タグ</p>
            <Broadcast.editor.Tags />
          </div>

          <div className="flex">
            <p className="w-48">配信言語</p>
            <Broadcast.editor.Language />
          </div>
          <div className="flex">
            <p className="w-48">ブランドコンテンツ</p>
            <Broadcast.editor.BrandedContents />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-error" type="button" onClick={props.onCancel}>
              {props.canncelLabel || "キャンセル"}
            </button>
            <button className="btn btn-success">{props.commmitLabel || "完了"}</button>
          </div>
        </div>
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
          <div className=" modal-box">
            <Broadcast.Apply />
            <Broadcast.Copy />
            <Broadcast.Edit />
            <Broadcast.Delete />
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
          <Broadcast.TagBadge />
        </div>
      </li>
    </>
  );
};
export const Events = () => {
  const createNewTemplate = Broadcast.uses.useCreate({ isNew: true });
  return (
    <div className="inline-flex items-center gap-3">
      {/* <button className="btn btn-outline btn-success btn-xs">過去の配信から追加</button> */}
      <button className="btn btn-outline btn-success btn-xs" onClick={createNewTemplate}>
        新規追加
      </button>
    </div>
  );
};
// TODO: editのページ化
export const Search = () => {
  const [input, onChange] = useInput("");
  const scroll = usePerfectScrollbar([]);
  const data = useSearchBroadcastTemplate(input);
  return (
    <div
      className={clsx("flex items-center dropdown dropdown-bottom dropdown-hover w-full", {
        "[&>input]:hover:rounded-b-none": !(data == null || data.length == 0),
      })}>
      <input
        className={clsx(
          "input input-bordered input-sm input-ghost grow bg-base-100 text-base-content rounded-lg",
          {
            "focus:rounded-b-none": !(data == null || data.length == 0),
          },
        )}
        value={input}
        onChange={onChange}
        placeholder="検索"
      />

      <div
        className={clsx(
          "dropdown-content z-10 bg-base-100 shadow-2xl w-full h-max max-h-96 perfect-scrollbar border-x rounded-b-lg",
          { "border-b": !(data == null || data.length == 0) },
        )}
        ref={scroll.ref}>
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
    </div>
  );
};
