import { createContext, DetailedHTMLProps, HTMLAttributes, ReactNode, useContext } from "react";
import { DBAction, DBComment, DBReward } from "@schemas/twitch/Actions";
import { Collection, Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import * as escaper from "html-escaper";

import { dayjs } from "@libs/dayjs";
import { urlLinkTagReplacement } from "@libs/regex";
import { getEmoteImage, twitchLinks } from "@libs/twitch";

import { User } from "./User";

const actionContext = createContext<DBAction | undefined>(undefined);
const useActionContext = () => useContext(actionContext);

const rewardContext = createContext<DBReward | undefined>(undefined);
const useRewardContext = () => useContext(rewardContext);
type TypeSpan = DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
type TypeLi = DetailedHTMLProps<HTMLAttributes<HTMLLIElement>, HTMLLIElement>;
type TypeUl = DetailedHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
type TypeTime = DetailedHTMLProps<HTMLAttributes<HTMLTimeElement>, HTMLTimeElement> & {
  format?: string;
};
// type TypeImage = Omit<
//   Omit<DetailedHTMLProps<HTMLAttributes<HTMLImageElement>, HTMLImageElement>, "src">,
//   "alt"
// >;

const ListProvider = (
  props: TypeUl & {
    data: DBAction[];
  },
) => {
  const { children, ...p } = props;

  return (
    <ul {...p}>
      {p.data?.map((val) => (
        <actionContext.Provider key={val.id} value={val}>
          {children}
        </actionContext.Provider>
      ))}
    </ul>
  );
};

const ListItem = (props: TypeLi) => {
  return <li {...props} />;
};

const SendedAt = (props: TypeTime) => {
  const ctx = useActionContext();
  return (
    <time {...props}>{dayjs(ctx?.timestamp).format(props.format || "YYYY/MM/DD hh:mm:ss")}</time>
  );
};

const Bits = (props: TypeSpan) => {
  const ctx = useActionContext();
  return <span {...props}>{ctx?.bits}</span>;
};

const UserProvider = (props: { children?: ReactNode }) => {
  const ctx = useActionContext();
  return <User.Provider id={ctx?.userId}>{props.children}</User.Provider>;
};

const RewardProvider = (props: { children?: ReactNode }) => {
  const action = useActionContext();
  if (action?.messageType === "reward") {
    return <rewardContext.Provider value={action}>{props.children}</rewardContext.Provider>;
  }
  return null;
};
const UserInput = (props: TypeSpan) => {
  const reward = useRewardContext();
  return <span {...props}>{reward?.userInput}</span>;
};
const UserTitle = (props: TypeSpan) => {
  const reward = useRewardContext();
  return <span {...props}>{reward?.userTitle}</span>;
};

const chatContext = createContext<DBComment | undefined>(undefined);
const useChatContext = () => useContext(chatContext);
const ChatProvider = (props: { children?: ReactNode }) => {
  const action = useActionContext();
  if (action?.messageType === "chat") {
    return <chatContext.Provider value={action}>{props.children}</chatContext.Provider>;
  }
  return null;
};
const Fragment = (props: TypeSpan) => {
  const chat = useChatContext();
  return (
    <span {...props}>
      {chat?.fragments.map((fragment, index) => {
        switch (fragment.type) {
          case "emote":
            return (
              <img
                key={index}
                src={getEmoteImage(fragment.emote.id)}
                alt={fragment.text}
                className="inline mx-1"
              />
            );
          case "text":
            return (
              <span
                key={index}
                className="break-all"
                dangerouslySetInnerHTML={{
                  __html: urlLinkTagReplacement(escaper.escape(fragment.text)),
                }}
              />
            );
          case "mention":
            return (
              <a
                className="link link-info"
                target="__blank"
                key={index}
                href={twitchLinks(fragment.mention.user_login).CHANNEL}>
                {fragment.text}
              </a>
            );
        }
      })}
    </span>
  );
};

export const chats = {
  ListProvider,
  ListItem,
  Provider: actionContext.Provider,
  SendedAt,
  UserProvider,
  Bits,
  reward: {
    RewardProvider,
    SendedAt,
    UserInput,
    UserTitle,
  },
  chat: {
    ChatProvider,
    Fragment,
  },
};
