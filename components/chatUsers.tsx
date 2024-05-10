import { useCallback, useMemo } from "react";
import clsx from "clsx";

import { DbUser } from "@resource/db";
import { useTiwtchUpdateUserById } from "@resource/twitchWithDb";
import { useEventSubContext } from "@contexts/twitch/eventSubContext";
import { twitchLinks } from "@libs/twitch";

import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";
import { Stat } from "./dasyui/Stat";
import { ICONS } from "./icons";

// https://daisyui.com/components/stat/

// TODO: ライブ視聴者の数とは違う旨を記述する https://daisyui.com/components/tooltip/
const TypeListItem = (props: { userData: DbUser }) => {
  const update = useTiwtchUpdateUserById(props.userData.id);
  const ctx = useEventSubContext();
  const handleSpam = useCallback(() => {
    const isSuccess = confirm("スパムとして認識させますか？");
    if (!isSuccess) return;
    update({ isSpam: true });
  }, [props.userData]);

  // TODO: 一旦チャンネルに飛ぶようにしてるけどUserInfoを出す
  const { CHANNEL } = twitchLinks(props.userData.login);

  if (ctx == null) return;

  return (
    <li className="flex gap-2">
      <div className="whitespace-nowrap w-full">
        <a href={CHANNEL} target="_blank" rel="noopener noreferrer" className="link">
          {props.userData.displayName || props.userData.login}
        </a>
      </div>

      <div>
        <a className="cursor-pointer font-black	" onClick={handleSpam}>
          x
        </a>
      </div>

      <div className="w-4">
        {ctx.followers.findIndex((val) => val.userId === props.userData.id) !== -1 ? "☑" : "☐"}
      </div>
    </li>
  );
};
export interface ChatUsersProps {
  type: "list" | "number" | "stat";
}
export const ChatUsers = (props: ChatUsersProps) => {
  const ctx = useEventSubContext();

  const chatUsers = useMemo(() => {
    if (ctx?.chatUsers == null) return;
    return ctx.chatUsers.sort((a, b) => (Number(a.id || "") < Number(b.id || "") ? 1 : -1));
  }, [ctx?.chatUsers]);
  const ps = usePerfectScrollbar([ctx?.chatUsers]);
  if (chatUsers == null) return;
  switch (props.type) {
    case "number":
      return <div>{chatUsers.length}</div>;
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
          value={`${chatUsers.length}人`}
          icon={ICONS.COMMENT}
        />
      );
    case "list":
      return (
        <div className={clsx("px-4 py-2 perfect-scrollbar")} ref={ps.ref}>
          <ul>
            {chatUsers
              .filter((val) => val.id !== ctx?.me.id)
              .map((val) => (
                <TypeListItem key={val.id} userData={val} />
              ))}
          </ul>
        </div>
      );
  }
};
