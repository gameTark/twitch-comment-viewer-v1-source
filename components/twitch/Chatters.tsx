import { useCallback } from "react";
import clsx from "clsx";
import { useLiveQuery } from "dexie-react-hooks";

import { db, DbUser } from "@resource/db";
import { useTiwtchUpdateUserById, useTwitchFollowersGetById } from "@resource/twitchWithDb";
import { useUserContext } from "@contexts/twitch/userContext";
import { filter } from "@libs/types";
import { useAsyncMemo } from "@libs/uses";

import { Stat } from "@components/dasyui/Stat";
import { ICONS } from "@components/icons";
import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";
import { useUserInfoModal } from "./User";

// https://daisyui.com/components/stat/
const TypeListItem = (props: { userData: DbUser }) => {
  const update = useTiwtchUpdateUserById(props.userData.id);
  const me = useLiveQuery(() => db.getMe(), []);
  const handleSpam = useCallback(() => {
    const isSuccess = confirm("スパムとして認識させますか？");
    if (!isSuccess) return;
    update({ isSpam: true });
  }, [props.userData]);
  const openModal = useUserInfoModal(props.userData.id);
  const followers = useTwitchFollowersGetById(me?.id);
  if (followers == null) return;
  return (
    <li className="flex gap-2">
      <div className="whitespace-nowrap w-full">
        <a className="link" tabIndex={0} onClick={() => openModal()}>
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
  const me = useLiveQuery(() => db.getMe(), []);
  const chatters = useLiveQuery(() => db.getChatters(), []);
  const userContext = useUserContext();
  const users = useLiveQuery(async () => {
    if (me == null) return;
    if (chatters == null) return;
    const result = await Promise.all(chatters.users.map((val) => userContext.fetchById(val)));
    return result.filter(filter.notNull);
  }, [me?.id, chatters]);
  
  const ps = usePerfectScrollbar([chatters]);

  switch (props.type) {
    case "number":
      return <div>{users?.length}</div>;
    case "stat":
      return (
        <Stat
          title={<div className="flex gap-2">チャットユーザー数</div>}
          value={`${users?.length}人`}
          icon={ICONS.COMMENT}
        />
      );
    case "list":
      return (
        <div className={clsx("px-4 py-2 perfect-scrollbar")} ref={ps.ref}>
          <ul>
            {users
              ?.filter((val) => val.id !== me?.id)
              .map((val) => <TypeListItem key={val.id} userData={val} />)}
          </ul>
        </div>
      );
  }
};
