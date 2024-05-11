import { useMemo } from "react";
import clsx from "clsx";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@resource/db";
import { useUserContext } from "@contexts/twitch/userContext";
import { deleteTwitchToken, twitchLinks } from "@libs/twitch";
import { useAsyncMemo } from "@libs/uses";

import ExternalIcon from "@components/icons/external";

export const Me = () => {
  const meInstance = useLiveQuery(() => db.getMe(), []);
  const userContext = useUserContext();

  const me = useAsyncMemo(async () => {
    if (meInstance?.id == null) return;
    return await userContext.fetchById(meInstance.id);
  }, [meInstance, userContext]);

  // ページとして切り出す
  const logout = () => {
    deleteTwitchToken();
    location.reload();
  };

  const links = useMemo(() => (me == null ? null : twitchLinks(me.login)), [me]);
  return (
    <div className="dropdown dropdown-top" style={{ lineHeight: 0 }}>
      <div className="avatar" tabIndex={0} role="button">
        <div
          className={clsx("w-12 h-12 rounded-full border border-primary", {
            skeleton: me?.profileImageUrl == null,
          })}>
          {me?.profileImageUrl != null ? <img src={me.profileImageUrl} /> : null}
        </div>
      </div>
      {links == null ? null : (
        <ul
          className="p-2 shadow menu dropdown-content z-[1] bg-base-100 text-base-content dasy-rounded w-52 border"
          tabIndex={0}>
          <li>
            <a className="link flex gap-x-2" target="_blank" href={links.CHANNEL}>
              チャンネルへ <ExternalIcon className="scale-90 origin-center" />
            </a>
          </li>
          <li>
            <a className="link flex gap-x-2" target="_blank" href={links.STREAM_MANAGER}>
              チャンネルマネージャーへ
              <ExternalIcon className="scale-90 origin-center" />
            </a>
          </li>
          <li onClick={logout}>
            <a>ログアウト</a>
          </li>
        </ul>
      )}
    </div>
  );
};
