"use client";

import { useCallback, useEffect } from "react";

import { db } from "@resource/db";
import { is } from "@libs/is";
import { hasLoginToken, initialTwitchToken, isLoginned, TwitchAPI } from "@libs/twitch";
import { useAsyncMemo, useLogin } from "@libs/uses";
import { createSharedWorker } from "@libs/workers";

export interface EventSubContextProps {
  children: JSX.Element | JSX.Element[];
}

export const TwitchRouter = (props: EventSubContextProps) => {
  const loginPage = useLogin();

  const main = useCallback(async () => {
    const isLogin = await isLoginned();
    if (!isLogin) {
      loginPage();
      return () => {};
    }
    const me = await TwitchAPI.users_get({
      parameters: {},
    });
    if (me?.data == null) {
      loginPage();
      return () => {};
    }
    const userData = me.data[0];
    const result = {
      id: userData.id,
      login: userData.login,
    };
    await db.parameters.put({
      type: "me",
      value: result,
    });

    const worker = createSharedWorker();
    worker.port.start();
    return () => {
      worker.port.close();
    };
  }, []);

  useEffect(() => {
    if (hasLoginToken()) {
      initialTwitchToken({
        onSuccess: () => {
          location.href = is.build.production ? "/twitch-comment-viewer-v1-frontend" : "/";
        },
      });
    } else {
      const destract = main();
      return () => {
        destract.then((destoy) => {
          destoy();
        });
      };
    }
  }, []);

  const isLogin = useAsyncMemo(async () => {
    return await isLoginned();
  }, []);

  if (hasLoginToken() || !isLogin) return <>{props.children}</>; // loading
  return <>{props.children}</>;
};
