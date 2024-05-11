import { useCallback } from "react";
import clsx from "clsx";

import { DbUser } from "@resource/db";
import { useTiwtchUpdateUserById, useTwitchFollowersGetById } from "@resource/twitchWithDb";
import { useEventSubContext } from "@contexts/twitch/eventSubContext";

import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";
import { Stat } from "./dasyui/Stat";
import { ICONS } from "./icons";
import { useUserInfoModal } from "./twitch/User";
import { useUserContext } from "@contexts/twitch/userContext";
import { useAsyncMemo } from "@libs/uses";
import { filter } from "@libs/types";

// https://daisyui.com/components/stat/
const TypeListItem = (props: { userData: DbUser }) => {
  const update = useTiwtchUpdateUserById(props.userData.id);
  const ctx = useEventSubContext();

  const handleSpam = useCallback(() => {
    const isSuccess = confirm("スパムとして認識させますか？");
    if (!isSuccess) return;
    update({ isSpam: true });
  }, [props.userData]);
  const openModal = useUserInfoModal(props.userData.id);
  const followers = useTwitchFollowersGetById(ctx?.me.id);

  if (ctx == null || followers == null) return;
  return (
    <li className="flex gap-2">
      <div className="whitespace-nowrap w-full">
        <a className="link" tabIndex={0} onClick={() => openModal}>
          {props.userData.displayName || props.userData.login}
        </a>
      </div>

      <div>
        <a className="cursor-pointer font-black	" onClick={handleSpam}>
          x
        </a>
      </div>

      <div className="w-4">
        {followers.findIndex((val) => val.userId === props.userData.id) !== -1 ? "☑" : "☐"}
      </div>
    </li>
  );
};
export interface ChatUsersProps {
  type: "list" | "number" | "stat";
}
export const ChatUsers = (props: ChatUsersProps) => {
  const ctx = useEventSubContext();
  const userContext = useUserContext();
  const users = useAsyncMemo(async () => {
    if (ctx == null) return;
    const result = await Promise.all(ctx.chatUsers.map(val => userContext.fetchById(val)));
    return result.filter(filter.notNull);
  }, [ctx?.chatUsers])
  const ps = usePerfectScrollbar([ctx?.chatUsers]);
  if (users == null) return;

  switch (props.type) {
    case "number":
      return <div>{users.length}</div>;
    case "stat":
      return (
        <Stat
          title={
            <div className="flex gap-2">
              チャットユーザー数{" "}
              <span
                className="tooltip tooltip-bottom tooltip-info"
                data-tip="`反映までには多少ラグが発生します。">
                {ICONS.INFORMATION}
              </span>
            </div>
          }
          value={`${users.length}人`}
          icon={ICONS.COMMENT}
        />
      );
    case "list":
      return (
        <div className={clsx("px-4 py-2 perfect-scrollbar")} ref={ps.ref}>
          <ul>
            {users
              .filter((val) => val.id !== ctx?.me.id)
              .map((val) => (
                <TypeListItem key={val.id} userData={val} />
              ))}
          </ul>
        </div>
      );
  }
};
