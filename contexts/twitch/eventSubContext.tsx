"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import {
  useFetchStream,
  useFetchTwitcChatUsersList,
  useTwitchFollowersGetById,
} from "@resource/twitchWithDb";
import * as Twitch from "@libs/twitch";
import { useAsyncMemo, useLogin } from "@libs/uses";
import { createSharedWorker } from "@libs/workers";

import { useTheme } from "@components/dasyui/Theme";
import { useInterval } from "@uses/useInterval";

// TODO: userDataのmeとevent subを分けたい気持ち
// TODO: 新しい人が来た時にToastで通知したい(chat user)
// TODO: フォロワー以外の人が来た時にToastで通知したい https://daisyui.com/components/toast/

interface Context {}
const context = createContext<Context | null>(null);
export const useEventSubContext = () => {
  const ctx = useContext(context);
  return ctx;
};

export interface EventSubContextProps {
  children: JSX.Element | JSX.Element[];
}
const isProd = process.env.NODE_ENV == "production";

export const EventSubContext = (props: EventSubContextProps) => {
  useTheme();
  useEffect(() => {
    Twitch.initialTwitchToken({
      onSuccess: () => {
        location.href = isProd ? "/twitch-comment-viewer-v1-frontend" : "/";
      },
    });
  }, []);
  const loginPage = useLogin();

  const main = useCallback(async () => {
    const isLogin = await Twitch.isLoginned();
    if (!isLogin) {
      loginPage();
      return () => {};
    }
    const { data } = await Twitch.fetchByMe();
    const userData = data[0];
    if (userData == null) {
      loginPage();
      return () => {};
    }
    const worker = createSharedWorker();
    worker.port.start();
    return () => {
      worker.port.close();
    };
  }, []);

  useEffect(() => {
    const destract = main();
    return () => {
      destract.then((destoy) => {
        destoy();
      });
    };
  }, []);

  const isLogin = useAsyncMemo(async () => {
    return await Twitch.isLoginned();
  }, []);

  if (Twitch.hasLoginToken() || !isLogin) return <>{props.children}</>; // loading
  return <context.Provider value={{}}>{props.children}</context.Provider>;
};
