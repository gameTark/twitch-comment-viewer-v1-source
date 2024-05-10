import { useMemo } from "react";
import clsx from "clsx";

import { useGetUserMapById } from "@resource/twitchWithDb";
import { useEventSubContext } from "@contexts/twitch/eventSubContext";
import { deleteTwitchToken, twitchLinks } from "@libs/twitch";

import ExternalIcon from "@components/icons/external";

export const Me = () => {
  const ctx = useEventSubContext();
  const users = useGetUserMapById();

  const me = useMemo(() => {
    if (ctx == null || users == null) return;
    return users.get(ctx.me.id);
  }, [ctx, users]);
  // ページとして切り出す
  const logout = () => {
    deleteTwitchToken();
    location.reload();
  };

  const links = useMemo(() => (ctx == null ? null : twitchLinks(ctx.me.channelName)), [ctx]);
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
