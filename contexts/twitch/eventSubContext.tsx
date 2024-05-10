"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { DbFollowers, DbUser } from "@resource/db";
import {
  useFetchStream,
  useFetchTwitcChatUsersList,
  useTwitchFollowers,
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

interface Context {
  me: {
    id: string;
    channelName: string;
  };
  chatUsers: DbUser[];
  live: ReturnType<typeof useFetchStream>["data"];
  followers: DbFollowers[];
  // socket: ReturnType<typeof createEventSubscribeSocket>;
}
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

  const { Provider } = context;
  const [userData, setUserData] = useState<{
    id: string;
    channelName: string;
  } | null>(null);

  useEffect(() => {
    Twitch.isLoginned().then((isLogin) => {
      if (!isLogin) {
        loginPage();
        return;
      }
      Twitch.fetchByMe()
        .then((res) => {
          // ログイン済みの場合
          if (res.data[0] == null) throw new Error("データが見つかりませんでした");
          setUserData({
            id: res.data[0].id,
            channelName: res.data[0].login,
          });
          const worker = createSharedWorker();
          worker.port.start();
        })
        .catch(() => {
          loginPage();
        });
    });
  }, []);

  const follower = useTwitchFollowers();
  const stream = useFetchStream();
  const chatterList = useFetchTwitcChatUsersList();
  useInterval(
    () => {
      if (userData?.id == null) return;
      chatterList.update({
        userId: userData.id,
        broadcasterId: userData.id,
      });
      follower.update(userData.id);
      stream.update(userData.id);
    },
    {
      interval: 10000,
      deps: [userData],
    },
  );
  const followers = useTwitchFollowersGetById(userData?.id);
  const isLogin = useAsyncMemo(async () => {
    return await Twitch.isLoginned();
  }, []);
  // ローディングページの設計を考える
  if (Twitch.hasLoginToken() || !isLogin || userData == null || followers == null)
    return <>{props.children}</>; // loading
  return (
    <Provider
      value={{
        me: {
          id: userData.id,
          channelName: userData.channelName,
        },
        live: stream.data,
        chatUsers: chatterList.data,
        // socket: socket,
        followers: followers,
      }}>
      {props.children}
    </Provider>
  );
};
