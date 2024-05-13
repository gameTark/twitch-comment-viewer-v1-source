import {
  ChangeEventHandler,
  createContext,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import clsx from "clsx";
import { useLiveQuery } from "dexie-react-hooks";

import { DbGame } from "@resource/db";
import { useGameContext } from "@contexts/twitch/gameContext";
import { parser } from "@libs/parser";
import { fetchSearchCategories } from "@libs/twitch";
import { useDebounce, useInput } from "@libs/uses";

import { ICONS } from "@components/icons";
import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";
import { ContextElements, createSpan, createTime } from "./interface";

const gameContext = createContext<DbGame | undefined | null>(null);
const useGame = () => useContext(gameContext);
const Provider = (props: { id?: DbGame["id"]; children?: ReactNode }) => {
  const gameCtx = useGameContext();
  const data = useLiveQuery(async () => {
    if (props.id == null) return;
    return await gameCtx.fetchById(props.id);
  }, [props.id]);

  return <gameContext.Provider value={data}>{props.children}</gameContext.Provider>;
};
const Name = createSpan(useGame, ["name"]);
const UpdateAt = createTime(useGame, ["updateAt"]);
const CreatedAt = createTime(useGame, ["createdAt"]);

const Image = (props: ContextElements["Image"]) => {
  const game = useGame();
  const twitchImage = useMemo(() => {
    return parser.twitchImage.parseImage(
      game?.box_art_url ||
        "https://static-cdn.jtvnw.net/ttv-static/404_boxart-{width}x{height}.jpg",
    )({
      width: Number(props.width) || 300,
      height: Math.round(Number(((Number(props.width) || 300) / 3) * 4)),
    });
  }, [game]);
  if (game == null) <img {...props} src={twitchImage} alt="404_box" />;
  return <img {...props} src={twitchImage} alt={game?.name} />;
};

const Search = (props: { onChange?: (id: DbGame["id"]) => void }) => {
  const [search, changeSearchHandler] = useInput();
  const [result, setResult] = useState<Awaited<ReturnType<typeof fetchSearchCategories>> | null>(
    null,
  );
  const onClick: MouseEventHandler<HTMLLIElement> = useCallback(
    (e) => {
      if (props.onChange == null) return;
      if (e.currentTarget.dataset.game == null) throw new Error("not found game");
      props.onChange(e.currentTarget.dataset.game);
    },
    [props.onChange],
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
        <div className={clsx("w-full border h-80 perfect-scrollbar bg-base-100")} ref={ps.ref}>
          {result != null ? (
            <ul className="flex flex-col gap-2 menu">
              {result.map((value) => {
                return (
                  <li key={value.id} data-game={value.id} onClick={onClick} tabIndex={0}>
                    <div className="flex">
                      <img
                        className="aspect-square object-cover rounded-btn border-2"
                        src={value.box_art_url}
                        alt={value.id}
                        width={52}
                      />
                      <p className=" text-sm">{value.name}</p>
                    </div>
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

const Input = (props: {
  value?: DbGame["id"];
  name?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) => {
  const refInput = useRef<HTMLInputElement>(null);
  const refModal = useRef<HTMLDialogElement>(null);

  const modalOpen = useCallback(() => {
    refModal.current?.showModal();
  }, [refModal.current]);

  const onClickModal = useCallback(
    (gameId: DbGame["id"]) => {
      refModal.current?.close();
      console.log(refModal.current);
      if (props.onChange == null) return;
      if (refInput.current == null) return;
      refInput.current.value = gameId;
      refInput.current.dispatchEvent(new Event("input", { bubbles: true }));
    },
    [props.onChange],
  );
  return (
    <>
      <div
        className="
        inline-flex
        cursor-pointer
        items-center
        gap-4
        border
        dasy-rounded
        rounded-btn
        p-2
      "
        onClick={modalOpen}>
        <input type="hidden" onInput={props.onChange} ref={refInput} name={props.name} />
        <Provider id={props.value}>
          <div className="flex justify-center items-center gap-2">
            <Image className="w-12 h-12 object-cover overflow-hidden rounded-btn border-2" />
            <Name className="font-bold">ゲーム未選択</Name>
            <div className="text-info">{ICONS.SEARCH}</div>
          </div>
        </Provider>
      </div>

      <dialog className="modal" ref={refModal}>
        <div className="modal-box h-min">
          <Game.Search onChange={onClickModal} />
        </div>
        <label className="modal-backdrop">
          <button>close</button>
        </label>
      </dialog>
    </>
  );
};

export const Game = {
  Provider,
  Name,
  Image,
  UpdateAt,
  CreatedAt,
  Search,
  Input,
};
