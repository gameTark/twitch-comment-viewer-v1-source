import { createContext, ReactNode, useContext } from "react";
import { DBAction, DBComment, DBReward } from "@schemas/twitch/Actions";
import * as escaper from "html-escaper";

import { urlLinkTagReplacement } from "@libs/regex";
import { getEmoteImage, twitchLinks } from "@libs/twitch";

import { ContextElements, createSpan, createTime } from "./interface";
import { User } from "./User";

/**
 * action list
 */
const ListProvider = (
  props: ContextElements['Ul'] & {
    data: DBAction[];
  },
) => {
  const { children, data, ...p } = props;

  return (
    <ul {...p}>
      {data?.map((val) => (
        <actionContext.Provider key={val.id} value={val}>
          {children}
        </actionContext.Provider>
      ))}
    </ul>
  );
};
const ListItem = (props: ContextElements['Li']) => {
  return <li {...props} />;
};

/**
 * action
 */
const actionContext = createContext<DBAction | undefined>(undefined);
const useActionContext = () => useContext(actionContext);
const ActonProvider = (props: { children?: ReactNode; data: DBAction }) => {
  return <actionContext.Provider value={props.data}>{props.children}</actionContext.Provider>;
};
const SendedAt = createTime(useActionContext, ["timestamp"]);
const Bits = createSpan(useActionContext, ["bits"]);

/**
 * reward
 */
const rewardContext = createContext<DBReward | undefined>(undefined);
const useRewardContext = () => useContext(rewardContext);
const RewardProvider = (props: { children?: ReactNode }) => {
  const action = useActionContext();
  if (action?.messageType === "reward") {
    return <rewardContext.Provider value={action}>{props.children}</rewardContext.Provider>;
  }
  return null;
};
const UserInput = createSpan(useRewardContext, ["userInput"]);
const UserTitle = createSpan(useRewardContext, ["userTitle"]);

/**
 * caht
 */
const chatContext = createContext<DBComment | undefined>(undefined);
const useChatContext = () => useContext(chatContext);
const ChatProvider = (props: { children?: ReactNode }) => {
  const action = useActionContext();
  if (action?.messageType === "chat") {
    return <chatContext.Provider value={action}>{props.children}</chatContext.Provider>;
  }
  return null;
};
const Fragment = (props: ContextElements['Span']) => {
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

/**
 * connection
 */
const UserProvider = (props: { children?: ReactNode }) => {
  const ctx = useActionContext();
  return <User.Provider id={ctx?.userId}>{props.children}</User.Provider>;
};

export const chats = {
  ListProvider,
  ListItem,
  Provider: ActonProvider,
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
