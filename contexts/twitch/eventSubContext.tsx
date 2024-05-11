"use client";

import { useCallback, useEffect } from "react";

import { useAsyncMemo, useLogin } from "@libs/uses";
import { createSharedWorker } from "@libs/workers";

import { useTheme } from "@components/dasyui/Theme";
import { hasLoginToken, initialTwitchToken, isLoginned } from "@libs/twitch";
import { db } from "@resource/db";
export interface EventSubContextProps {
  children: JSX.Element | JSX.Element[];
}
const isProd = process.env.NODE_ENV == "production";

export const EventSubContext = (props: EventSubContextProps) => {
  useTheme();
  const loginPage = useLogin();

  useEffect(() => {
    initialTwitchToken({
      onSuccess: () => {
        location.href = isProd ? "/twitch-comment-viewer-v1-frontend" : "/";
      },
    });
  }, []);

  const main = useCallback(async () => {
    const isLogin = await isLoginned();
    if (!isLogin) {
      loginPage();
      return () => {};
    }
    const userData = await db.getMe();
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
    return await isLoginned();
  }, []);

  if (hasLoginToken() || !isLogin) return <>{props.children}</>; // loading
  return <>{props.children}</>;
};
