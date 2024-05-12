import { createContext, DetailedHTMLProps, HTMLAttributes, ReactNode, useContext } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { DbGame } from "@resource/db";
import { useGameContext } from "@contexts/twitch/gameContext";
import { dayjs } from "@libs/dayjs";

const gameContext = createContext<DbGame | undefined | null>(null);
const useGame = () => useContext(gameContext);

const Provider = (props: { id?: DbGame["id"]; children: ReactNode }) => {
  const gameCtx = useGameContext();
  const data = useLiveQuery(async () => {
    if (props.id == null) return;
    return await gameCtx.fetchById(props.id);
  }, [props.id]);

  return <gameContext.Provider value={data}>{props.children}</gameContext.Provider>;
};

const Name = (props: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>) => {
  const game = useGame();
  return <span {...props}>{game?.name}</span>;
};

const Image = (
  props: Omit<
    Omit<DetailedHTMLProps<HTMLAttributes<HTMLImageElement>, HTMLImageElement>, "src">,
    "alt"
  >,
) => {
  const game = useGame();
  return <img {...props} src={game?.box_art_url} alt={game?.name} />;
};

const UpdateAt = (
  props: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> & {
    format?: string;
  },
) => {
  const game = useGame();
  return (
    <span {...props}>{dayjs(game?.updateAt).format(props.format || "YYYY/MM/DD hh:mm:ss")}</span>
  );
};
const CreatedAt = (
  props: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> & {
    format?: string;
  },
) => {
  const game = useGame();
  return (
    <span {...props}>{dayjs(game?.createdAt).format(props.format || "YYYY/MM/DD hh:mm:ss")}</span>
  );
};

export const Game = {
  Provider,
  Name,
  Image,
  UpdateAt,
  CreatedAt,
};
