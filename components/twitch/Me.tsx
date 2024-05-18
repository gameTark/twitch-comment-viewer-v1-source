import { useMemo } from "react";
import clsx from "clsx";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@resource/db";
import { deleteTwitchToken, twitchLinks } from "@libs/twitch";

import { ICONS } from "@components/icons";
import { User } from "./withContext/User";

export const Me = () => {
  const meInstance = useLiveQuery(() => db.getMe(), []);

  const me = useLiveQuery(async () => {
    return await db.getMe();
  }, [meInstance]);

  // ページとして切り出す
  const logout = () => {
    deleteTwitchToken();
    location.reload();
  };

  const navigation = useMemo(() => {
    if (me == null) return [];
    const links = twitchLinks(me.login);
    return [
      {
        value: "ボットアカウントの見極め方",
        external: true,
        href: "https://twitchinsights.net/bots",
      },
      {
        value: "チャンネルへ",
        external: true,
        href: links.CHANNEL,
      },
      {
        value: "チャンネルマネージャーへ",
        external: true,
        href: links.STREAM_MANAGER,
      },
    ];
  }, [me]);

  return (
    <User.Provider id={me?.id}>
      <div className="dropdown dropdown-top" style={{ lineHeight: 0 }}>
        <div className="avatar" tabIndex={0} role="button">
          <div className={clsx("w-12 h-12 rounded-full border border-primary")}>
            <User.ProfileImage />
          </div>
        </div>
        <ul
          className="p-2 shadow menu dropdown-content z-[1] bg-base-100 text-base-content dasy-rounded w-64 border"
          tabIndex={0}>
          {navigation.map((val) => (
            <li key={val.value}>
              <a
                className="link flex justify-between items-center"
                target={val.external ? "_blank" : undefined}
                href={val.href}>
                {val.value} {val.external ? ICONS.EXTERNAL : null}
              </a>
            </li>
          ))}
          <li onClick={logout}>
            <a>ログアウト</a>
          </li>
        </ul>
      </div>
    </User.Provider>
  );
};
