"use client";

import { ReactNode, useMemo } from "react";

import { useGameContext } from "@contexts/twitch/gameContext";
import { parser } from "@libs/parser";
import { useAsyncMemo } from "@libs/uses";

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
