import { createContext, ReactNode, useContext } from "react";

import { DbBroadcastTemplate } from "@resource/db";
import { BROADCAST_LANGUAGE } from "@libs/twitch";

import { ContextElements, createSpan } from "./interface";

const boroadcastContext = createContext<DbBroadcastTemplate | undefined | null>(null);
const useBroadcastTemplate = () => useContext(boroadcastContext);
const Provider = (props: { data?: DbBroadcastTemplate; children: ReactNode }) => {
  return (
    <boroadcastContext.Provider value={props.data}>{props.children}</boroadcastContext.Provider>
  );
};
const Title = createSpan(useBroadcastTemplate, ["broadcastTitle"]);
const Language = (props: ContextElements["Span"]) => {
  const template = useBroadcastTemplate();
  const lang = BROADCAST_LANGUAGE.find((val) => val.id === template?.language)?.name;
  if (lang == null) return <span {...props} />;
  return <span {...props}>{lang}</span>;
};
const TagBadge = () => {
  const template = useBroadcastTemplate();
  template?.tags;
};

export const Broadcast = {
  Provider,
  Title,
  Language,
};
