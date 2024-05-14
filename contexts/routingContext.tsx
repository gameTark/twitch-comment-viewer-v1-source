"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { hasLoginToken, initialTwitchToken, isLoginned } from "@libs/twitch";

import { useRouterPush } from "@uses/useApplicationRouter";

type ApplicationRoutingState =
  | "initialize"
  | "from-info"
  | "before-login"
  | "loggined"
  | "getting-token";

export const ApplicationRouter = (props: { children?: JSX.Element }) => {
  const [state, setState] = useState<ApplicationRoutingState>("initialize");
  const routerPush = useRouterPush();

  useEffect(() => {
    switch (state) {
      case "initialize":
        return;
      case "before-login":
        routerPush.login();
        return;
      case "getting-token":
        initialTwitchToken({
          onSuccess: () => {
            // routerPush.application();
          },
        });
        return;
      case "loggined":
        // routerPush.application();
        return;
      default:
        return;
    }
  }, [state]);

  useEffect(() => {
    // トークンがAPIから返却されている場合
    if (hasLoginToken()) {
      setState("getting-token");
      return;
    }

    // ログイン済み
    isLoginned().then((res) => {
      if (res) {
        setState("loggined");
        return;
      }
      setState("before-login");
    });
  }, []);

  return <>{props.children}</>;
};
