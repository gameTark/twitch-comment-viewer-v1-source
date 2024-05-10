import { DbUser } from "@resource/db";
import { dayjs } from "@libs/dayjs";
import { filter } from "@libs/types";

import { Chat } from "@components/chat";
import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";
import { useGetCommentsByUserId } from "../../watcher/useCommentWatcher";

export const TwitchChat = (props: { userId?: DbUser["id"] }) => {
  const comments = useGetCommentsByUserId(props.userId || null);
  const scroll = usePerfectScrollbar([comments]);
  return (
    <div className="h-full flex flex-col">
      <div ref={scroll.ref} className="perfect-scrollbar">
        <ul className="flex flex-col">
          {comments.length === 0 ? <p>まだコメントが収集できてないです。</p> : null}
          {comments
            .map((val) => {
              if (val.messageType !== "chat") return;
              const target =
                val.fragments != null && val.fragments.length !== 0 ? (
                  <Chat fragments={val.fragments} />
                ) : (
                  val.message
                );
              return (
                <li
                  key={val.id}
                  className="break-words flex items-center px-2 justify-stretch border-b  border-base-300">
                  <time className="opacity-70 text-xs pr-1 whitespace-nowrap">
                    {dayjs(val.timestamp).format("YYYY/MM/DD hh:mm:ss")}
                  </time>
                  <p className="px-2 py-1 border-l border-base-300">{target}</p>
                </li>
              );
            })
            .filter(filter.notNull)}
        </ul>
      </div>
      <div className="px-2 py-1 border-t-2 text-right">総コメント数:{comments.length}</div>
    </div>
  );
};
