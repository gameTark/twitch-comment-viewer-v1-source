import { useCallback } from "react";
import clsx from "clsx";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@resource/db";

import { useDialog } from "@components/commons/Dialog";
import { Scroll } from "@components/commons/PerfectScrollbar";
import { Stat } from "@components/dasyui/Stat";
import { ICONS } from "@components/icons";
import { useUserInfoModal } from "./UserInfo";
import { Follower } from "./withContext/Follower";
import { User } from "./withContext/User";

// https://daisyui.com/components/stat/
const TypeListItem = () => {
  const open = useUserInfoModal();
  const update = User.useUpdateUser();
  const openDialog = useDialog();

  const spam = useCallback(() => {
    openDialog.open({
      title: "スパムとして認識させますか？",
      onSuccess: () => {
        update({
          isSpam: true,
        });
      },
    });
  }, []);
  return (
    <div className="flex items-center justify-between gap-1">
      <span className=" inline-block w-full whitespace-nowrap text-xs">
        <User.Name className=" cursor-pointer" onClick={() => open()} />
      </span>
      <Follower.Badge type="icon" />
      <span className="cursor-pointer" onClick={spam}>
        {<ICONS.CROSS.SIZE size={16} />}
      </span>
    </div>
  );
};
export interface ChatUsersProps {
  type: "list" | "number" | "stat";
}
export const ChatUsers = (props: ChatUsersProps) => {
  const chatters = useLiveQuery(async () => {
    const chatters = await db.getChatters();
    const me = await db.getMe();
    if (me == null) return;
    if (chatters == null) return;
    return chatters.users.filter((val) => val !== me.id);
  }, []);

  switch (props.type) {
    case "number":
      return <div>{chatters?.length || 0}</div>;
    case "stat":
      return (
        <Stat
          title={<div className="flex gap-2">チャットユーザー数</div>}
          value={`${chatters?.length || 0}人`}
        />
      );
    case "list":
      return (
        <Scroll className={clsx("px-1 py-2")}>
          <ul className="flex flex-col gap-1">
            {chatters?.map((val) => (
              <Follower.Provider key={val} id={val}>
                <User.Provider id={val}>
                  <TypeListItem />
                </User.Provider>
              </Follower.Provider>
            ))}
          </ul>
        </Scroll>
      );
  }
};
