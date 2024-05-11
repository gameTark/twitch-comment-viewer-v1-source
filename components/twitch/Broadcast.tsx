"use client";

import React, { ChangeEventHandler, useCallback, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { db, DbBroadcastTemplate } from "@resource/db";
import {
  deleteBroadcastTemplate,
  getBroadcastTemplates,
  putBroadcastTemplate,
  updateBroadcastTemplate,
} from "@resource/twitchWithDb";
import { BROADCAST_LANGUAGE, CLASSIFICATION_LABELS, fetchChannelInfoPatch } from "@libs/twitch";
import { filter } from "@libs/types";

import { AddCard } from "@components/commons/addCard";
import { useDialog } from "@components/commons/Dialog";
import { MultiTag } from "@components/commons/multiTag";
import { DasyBadge } from "@components/dasyui/Badge";
import { Checkbox } from "@components/dasyui/Checkbox";
import { Select } from "@components/dasyui/Select";
import { GameInput, GameViewer } from "@components/twitch/Game";

// DbBroadcastTemplate
export type HandleBroadcastViewerEvents = (event: DbBroadcastTemplate) => void;
export interface BroadcastViewerEvents {
  onEdit?: HandleBroadcastViewerEvents;
  onApply?: HandleBroadcastViewerEvents;
  onDelete?: HandleBroadcastViewerEvents;
}

export function BroadcastViewer(_props: DbBroadcastTemplate & BroadcastViewerEvents) {
  const { onEdit, onApply, onDelete, ...props } = _props;

  const handleEdit = useCallback(() => {
    if (onEdit == null) return;
    onEdit({ ...props });
  }, []);

  const handleApply = useCallback(() => {
    if (onApply == null) return;
    onApply({ ...props });
  }, []);

  const handleDelete = useCallback(() => {
    if (onDelete == null) return;
    onDelete({ ...props });
  }, []);

  const handleFavorite: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    if (props.id == null) throw new Error("not found props id");
    updateBroadcastTemplate(props.id, {
      favorite: e.currentTarget.checked,
    });
  }, []);
  return (
    <div className="relative z-0 h-full">
      <div
        className="
        absolute
        flex
        flex-col
        gap-4
        justify-center
        items-center
        px-10
        cursor-pointer
        rounded-box
        
        top-0
        left-0
        
        w-full
        h-full
        
        bg-base-content
        bg-opacity-70
        opacity-0
        hover:opacity-100
        transition
        
        z-40
      ">
        <button className="btn btn-outline btn-success w-full" onClick={handleApply}>
          配信に適用
        </button>
        <button className="btn btn-outline btn-info w-full" onClick={handleEdit}>
          編集
        </button>
        <button className="btn btn-outline btn-error w-full" onClick={handleDelete}>
          削除
        </button>
      </div>
      <GameViewer
        id={props.gameId}
        type="card"
        body={
          <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-col gap-2">
              <p className="text-caption">配信タイトル</p>
              <p>{props.broadcastTitle}</p>
            </div>
            <p className="grow h-full">{props.isBrandedContent ? "ブランドコンテンツ" : null}</p>
            <div className="flex gap-2 flex-wrap justify-end">
              {props.tags.map((val) => (
                <DasyBadge size="badge-sm" key={val}>
                  {val}
                </DasyBadge>
              ))}
            </div>
          </div>
        }
      />

      <div
        className="
          absolute
          top-0
          right-0
          z-50
          bg-red
          pt-1
          pr-2
          opacity-100
          select-none
        ">
        <input
          type="checkbox"
          defaultChecked={props.favorite}
          className="
          text-2xl
          text-warning
          before:content-['☆']
          checked:before:content-['★']
          cursor-pointer
          appearance-none	
        "
          onInput={handleFavorite}
        />
      </div>
    </div>
  );
}

export function BroadcastInformation() {
  const [state, setState] = useState<DbBroadcastTemplate>(INITIAL_BROADCAST_STATE);
  const me = useLiveQuery(() => db.getMe(), []);

  const [type, setType] = useState("viewer");
  const dialog = useDialog();
  const handleBroadcastContent: HandleBroadcastContent = useCallback((ev) => {
    setState({
      ...ev,
    });
  }, []);

  const handleEdit = useCallback((event?: DbBroadcastTemplate) => {
    setState(event || { ...INITIAL_BROADCAST_STATE });
    setType("edit");
  }, []);

  const handleCancel = useCallback(() => {
    setState({ ...INITIAL_BROADCAST_STATE });
    setType("viewer");
  }, []);

  const handleAdd: HandleBroadcastContent = (e) => {
    if (e.gameId == null) return;
    if (me == null) return;
    putBroadcastTemplate({
      id: e.id,
      channelId: me.id,
      gameId: e.gameId,
      broadcastTitle: e.broadcastTitle,
      language: e.language,
      tags: e.tags,
      classificationLabels: e.classificationLabels,
      isBrandedContent: e.isBrandedContent,
    });
    setState({ ...INITIAL_BROADCAST_STATE });
    setType("viewer");
  };
  const handleDelete: HandleBroadcastViewerEvents = useCallback((ev) => {
    dialog.open({
      title: "削除しますか？",
      onSuccess: () => {
        if (ev.id == null) return;
        deleteBroadcastTemplate([ev.id]);
      },
    });
  }, []);
  const handleApply: HandleBroadcastViewerEvents = useCallback((ev) => {
    const id = me?.id;
    if (id == null) return;
    dialog.open({
      title: "配信に適用しますか？",
      onSuccess: () => {
        return fetchChannelInfoPatch({
          id: {
            broadcaster_id: id,
          },
          patch: {
            game_id: ev.gameId,
            broadcaster_language: ev.language,
            title: ev.broadcastTitle,
            tags: ev.tags,
            content_classification_labels: ev.classificationLabels,
            is_branded_content: ev.isBrandedContent,
          },
        }).then(() => {
          dialog.close();
        });
      },
    });
  }, []);

  const allItems = useLiveQuery(async () => {
    return (await getBroadcastTemplates()).filter(filter.notNull);
  }, []);

  const favoriteItems = useLiveQuery(async () => {
    return (await getBroadcastTemplates({ type: "favorite", value: true })).filter(filter.notNull);
  }, []);

  if (type === "edit") {
    return (
      <div className="flex justify-center px-20 pt-10">
        <BroadcastEditor
          value={state}
          onChange={handleBroadcastContent}
          onCommit={handleAdd}
          commmitLabel="確定"
          onCancel={handleCancel}
        />
      </div>
    );
  }
  if (type === "viewer") {
    return (
      <div className="p-10 h-fit flex flex-col gap-5">
        <h2 className="heading-2">お気に入り</h2>
        <div className="flex gap-y-7 gap-x-2 items-stretch flex-wrap">
          {favoriteItems?.map((val) => {
            if (val.id == null) return;
            return (
              <div className="w-60 flex" key={val.id}>
                <BroadcastViewer
                  {...val}
                  onEdit={handleEdit}
                  onApply={handleApply}
                  onDelete={handleDelete}
                />
              </div>
            );
          })}
        </div>
        <h2 className="heading-2">全件</h2>
        <div className="flex gap-y-7 gap-x-2 items-stretch flex-wrap">
          {allItems?.map((val) => {
            if (val.id == null) return;
            return (
              <div className="w-60 flex" key={val.id}>
                <BroadcastViewer
                  {...val}
                  onEdit={handleEdit}
                  onApply={handleApply}
                  onDelete={handleDelete}
                />
              </div>
            );
          })}
        </div>
        <div className="fixed bottom-0 right-0 w-20 h-20 mb-24 mr-10">
          <AddCard onClick={handleEdit} />
        </div>
      </div>
    );
  }
  return null;
}

export const INITIAL_BROADCAST_STATE: DbBroadcastTemplate = {
  broadcastTitle: "",
  language: "",
  tags: [],
  classificationLabels: [],
  isBrandedContent: false,
  favorite: false,
};
export type HandleBroadcastContent = (ev: DbBroadcastTemplate) => void;
export type BroadcastProps = {
  value: DbBroadcastTemplate;
  commmitLabel?: string;
  canncelLabel?: string;
  onChange?: HandleBroadcastContent;
  onCommit?: HandleBroadcastContent;
  onCancel?: () => void;
};
const FIELD_NAMES = {
  title: "title",
  gameId: "gameId",
  language: "language",
  tags: "tags",
  classificationLabels: "classification-labels",
  isBrandedContents: "isBrandedContents",
};
export default function BroadcastEditor(props: BroadcastProps) {
  const refInput = useRef<DbBroadcastTemplate>(props.value);

  const onChangeState: ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = useCallback(
    (changeEvent) => {
      if (props.onChange == null) return;
      switch (changeEvent.currentTarget.name) {
        case FIELD_NAMES.title:
          refInput.current.broadcastTitle = changeEvent.currentTarget.value;
          break;
        case FIELD_NAMES.gameId:
          refInput.current.gameId = changeEvent.currentTarget.value;
          break;
        case FIELD_NAMES.language:
          refInput.current.language = changeEvent.currentTarget.value;
          break;
        case FIELD_NAMES.tags:
          refInput.current.tags = changeEvent.currentTarget.value
            .split(",")
            .filter((val) => val != "");
          break;
        case FIELD_NAMES.classificationLabels:
          if (changeEvent.currentTarget instanceof HTMLSelectElement) break;
          if (changeEvent.currentTarget.checked) {
            refInput.current.classificationLabels.push(changeEvent.currentTarget.value);
          } else {
            refInput.current.classificationLabels = refInput.current.classificationLabels.filter(
              (val) => val !== changeEvent.currentTarget.value,
            );
          }
          break;
        case FIELD_NAMES.isBrandedContents:
          if (changeEvent.currentTarget instanceof HTMLSelectElement) break;
          refInput.current.isBrandedContent = changeEvent.currentTarget.checked;
          break;
      }
      props.onChange(refInput.current);
    },
    [props.onChange],
  );

  const handleSubmit = () => {
    props.onCommit && props.onCommit(refInput.current);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-5 py-4 px-10">
        {/* section title */}
        <div className="flex">
          <p className="w-48">配信タイトル</p>
          <input
            className="input input-bordered w-full max-w-xs"
            type="text"
            onChange={onChangeState}
            name={FIELD_NAMES.title}
            value={props.value.broadcastTitle}
          />
        </div>

        {/* section game */}
        <div className="flex">
          <p className="w-48">配信ゲーム</p>
          <GameInput
            name={FIELD_NAMES.gameId}
            value={props.value.gameId}
            onChange={onChangeState}
          />
        </div>

        {/* 開始通知 */}
        {/* <div className="flex">
          <p className="w-48">開始通知</p>
          <input className="input input-bordered w-full max-w-xs" type="text" name="hoge" />
        </div> */}

        {/* 配信言語 */}
        <div className="flex">
          <p className="w-48">配信言語</p>
          <Select bordered name={FIELD_NAMES.language} onChange={onChangeState}>
            <option disabled>選択言語</option>
            {BROADCAST_LANGUAGE.map((val) => (
              <option key={val.id} value={val.id}>
                {val.name}
              </option>
            ))}
          </Select>
        </div>

        {/* オーディエンス 使えない人もいるっぽい */}

        {/* タグ */}
        <div className="flex">
          <p className="w-48">配信タグ</p>
          <MultiTag
            value={props.value.tags.join(",")}
            name={FIELD_NAMES.tags}
            onChange={onChangeState}
          />
        </div>

        {/* コンテンツ分類 */}
        <div className="flex">
          <p className="w-48">コンテンツ分類</p>
          <div className="flex flex-col gap-4">
            {CLASSIFICATION_LABELS.map((val) => (
              <Checkbox
                key={val.id}
                value={val.id}
                label={val.name}
                name={FIELD_NAMES.classificationLabels}
                color="info"
                onChange={onChangeState}
                defaultChecked={props.value.classificationLabels.includes(val.id)}
              />
            ))}
          </div>
        </div>

        {/* 再配信 */}
        {/* <div className="flex">
          <p className="w-48">再配信</p>
          <div className="flex flex-col gap-4">
            <input type="checkbox" className="ios-toggle" name="" id="" />
          </div>
        </div> */}

        {/* ブランドコンテンツ */}
        <div className="flex">
          <p className="w-48">ブランドコンテンツ</p>
          <div className="flex flex-col gap-4">
            <input
              type="checkbox"
              className="ios-toggle"
              name={FIELD_NAMES.isBrandedContents}
              defaultChecked={props.value.isBrandedContent}
              onChange={onChangeState}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          {props.onCancel != null ? (
            <button className="btn btn-warning" onClick={props.onCancel}>
              {props.canncelLabel == null ? "キャンセル" : props.canncelLabel}
            </button>
          ) : null}
          <button className="btn btn-success" onClick={handleSubmit}>
            {props.commmitLabel == null ? "編集完了" : props.commmitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}