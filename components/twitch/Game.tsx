"use client";

import {
  ChangeEventHandler,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import clsx from "clsx";

import { DbGame } from "@resource/db";
import { useGameContext } from "@contexts/twitch/gameContext";
import { parser } from "@libs/parser";
import { fetchSearchCategories } from "@libs/twitch";
import { useAsyncMemo, useDebounce, useInput } from "@libs/uses";

import { useModalContext } from "@components/dasyui/Modal";
import { ICONS } from "@components/icons";
import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";

interface Item {
  id?: string;
  type: "item";
}
interface Card {
  id?: string;
  type: "card";
  body?: ReactNode;
  actions?: ReactNode;
}
export const GameViewer = (props: Item | Card) => {
  const gameContext = useGameContext();
  const game = useAsyncMemo(async () => {
    if (props.id == null) return;
    return await gameContext.fetchById(props.id);
  }, [props]);
  const twitchImage = useMemo(() => {
    if (game == null) return;
    return parser.twitchImage.parseImage(game.box_art_url)({
      width: 300,
      height: 400,
    });
  }, [game]);
  const isNotSelected = props.id == null;
  const isLoading = game == null;

  switch (props.type) {
    case "item":
      return (
        <div className="flex items-center gap-2 cursor-pointer w-full">
          <div className="avatar placeholder">
            {isNotSelected ? (
              <div className="w-16 dasy-rounded bg-neutral text-neutral-content">
                <span className="text-3xl">G</span>
              </div>
            ) : (
              <div className="w-16 dasy-rounded">
                {isLoading ? (
                  <div className="skeleton w-full h-full"></div>
                ) : (
                  <img src={twitchImage} alt={game.name} width={80} />
                )}
              </div>
            )}
          </div>
          {isNotSelected ? (
            <p className="font-black">ゲーム未選択</p>
          ) : isLoading ? (
            <p className="font-black skeleton w-full">&nbsp;</p>
          ) : (
            <p className="font-black">{game.name}</p>
          )}
        </div>
      );
    case "card":
      if (props.id == null) return <div></div>;
      return (
        <div className="card w-full h-full bg-base-100 shadow-xl image-full select-none cursor-pointer">
          {isLoading ? (
            <div className="f-hull w-full aspect-square" />
          ) : (
            <figure>
              <img
                src={twitchImage}
                alt={game.name}
                className="w-full object-cover aspect-square"
              />
            </figure>
          )}
          <div className="card-body">
            <h2 className="card-title">
              {isLoading ? <div className="skeleton w-full">&nbsp;</div> : game.name}
            </h2>
            {isLoading ? <div className="skeleton w-full h-full">&nbsp;</div> : props.body}
            {props.actions != null ? <div className="card-actions">{props.actions}</div> : null}
          </div>
        </div>
      );
  }
};

export const GameInput = (props: {
  value?: DbGame["id"];
  name?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) => {
  const refInput = useRef<HTMLInputElement>(null);
  const modal = useModalContext();

  const onClickModal = useCallback(
    (gameId: DbGame["id"]) => {
      modal.close();
      if (props.onChange == null) return;
      if (refInput.current == null) return;
      refInput.current.value = gameId;
      refInput.current.dispatchEvent(new Event("input", { bubbles: true }));
    },
    [modal, props.onChange],
  );

  const openSearchModal = useCallback(() => {
    modal.open(<Search onClick={onClickModal} />);
  }, [modal]);

  return (
    <div
      className="
        inline-flex
        cursor-pointer
        items-center
        gap-4
        border
        dasy-rounded
        p-2
      "
      onClick={openSearchModal}>
      <input type="hidden" onInput={props.onChange} ref={refInput} name={props.name} />
      <GameViewer id={props.value} type="item" />
      <div className="text-info">{ICONS.SEARCH}</div>
    </div>
  );
};

export const Search = (props: { onClick?: (id: DbGame["id"]) => void }) => {
  const [search, changeSearchHandler] = useInput();
  const [result, setResult] = useState<Awaited<ReturnType<typeof fetchSearchCategories>> | null>(
    null,
  );
  const onClick: MouseEventHandler<HTMLLIElement> = useCallback(
    (e) => {
      if (props.onClick == null) return;
      if (e.currentTarget.dataset.game == null) throw new Error("not found game");
      props.onClick(e.currentTarget.dataset.game);
    },
    [props.onClick],
  );

  const event = useDebounce(
    500,
    async (text: string) => {
      if (text === "" || text == null) return null;
      const item = await fetchSearchCategories({
        query: text,
      });
      setResult(item);
    },
    [],
  );

  useEffect(() => {
    event(search);
  }, [search]);

  const ps = usePerfectScrollbar([result]);
  return (
    <div className="h-96">
      <div className="flex flex-col gap-5">
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered w-full max-w-xs"
          value={search}
          onChange={changeSearchHandler}
        />
        <div
          className={clsx("w-full border dasy-rounded h-80 perfect-scrollbar bg-base-100")}
          ref={ps.ref}>
          {result != null ? (
            <ul className="flex flex-col gap-2 menu">
              {result.map((value) => {
                return (
                  <li key={value.id} data-game={value.id} onClick={onClick} tabIndex={0}>
                    <GameViewer id={value.id} type="item" />
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
};
