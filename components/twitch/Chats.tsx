import { useMemo } from "react";
import { DBUser } from "@schemas/twitch/User";
import { useLiveQuery } from "dexie-react-hooks";

import { db, useDbPagination } from "@resource/db";
import { dayjs } from "@libs/dayjs";

import { ChatBubble } from "@components/dasyui/ChatBubble";
import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";
import { useUserInfoModal } from "./UserInfo";
import { chats } from "./withContext/ChatList";
import { User } from "./withContext/User";

const TypeBubble = () => {
  const openModal = useUserInfoModal();
  return (
    <chats.ListItem className="w-full px-2">
      {/* chat */}
      <chats.chat.ChatProvider>
        <ChatBubble
          type="chat-end"
          imageNode={<User.ProfileImage onClick={() => openModal()} tabIndex={0} />}
          header={
            <User.Name className="inline-block mb-1" onClick={() => openModal()} tabIndex={0} />
          }
          message={<chats.chat.Fragment />}
          footer={<chats.SendedAt className="inline-block mt-1" format="hh:mm:ss" />}
        />
      </chats.chat.ChatProvider>

      {/* reward */}
      <chats.reward.RewardProvider>
        <div className="flex items-center gap-2 justify-center">
          <User.ProfileImage
            className="rounded-full w-10 border-2 overflow-hidden cursor-pointer"
            tabIndex={0}
            onClick={() => openModal()}
          />
          <div className="flex items-center gap-1">
            <User.Name
              className="font-bold cursor-pointer"
              tabIndex={0}
              onClick={() => openModal()}
            />
            <span>が</span>
            <chats.reward.UserTitle className="font-bold" />
            <span>と交換しました。</span>
          </div>
        </div>
      </chats.reward.RewardProvider>
    </chats.ListItem>
  );
};
const TypeFlat = () => {
  return (
    <chats.ListItem className="w-full border-b-2 last:border-0 pb-2">
      {/* chat */}
      <chats.chat.ChatProvider>
        <chats.chat.Fragment />
      </chats.chat.ChatProvider>

      {/* reward */}
      <chats.reward.RewardProvider>
        <chats.reward.UserTitle className="font-bold" />
      </chats.reward.RewardProvider>
    </chats.ListItem>
  );
};
const TypeMini = () => {
  return (
    <chats.ListItem className="w-full border-b-2 px-2 last:border-0 pb-2 flex items-center gap-3">
      <User.Name className=" inline-block text-xs font-bold min-w-32" />

      {/* chat */}
      <span className="inline-block grow">
        <chats.chat.ChatProvider>
          <chats.chat.Fragment />
        </chats.chat.ChatProvider>

        {/* reward */}
        <chats.reward.RewardProvider>
          <span className="inline-flex gap-2 items-center">
            <span className=" inline-block text-sm font-bold">リワード交換</span>
            <chats.reward.UserTitle className=" text-info font-black" />
          </span>
        </chats.reward.RewardProvider>
      </span>
      <chats.SendedAt format="hh:mm:ss" className="text-xs opacity-70" />
    </chats.ListItem>
  );
};

export const ChatList = (props: { type: string; query: Parameters<typeof getActions>[0] }) => {
  const data = useLiveQuery(async () => {
    return await getActions(props.query).reverse().sortBy("timestamp");
  }, [props.query]);
  const scroll = usePerfectScrollbar([data]);

  const target = useMemo(() => {
    switch (props.type) {
      case "viewewr":
        return <TypeBubble />;
      case "flat":
        return <TypeFlat />;
      case "mini":
        return <TypeMini />;
    }
    return <TypeBubble />;
  }, [props.type]);
  return (
    <div className="h-full perfect-scrollbar" ref={scroll.ref}>
      <chats.ListProvider data={data || []} className="flex flex-col gap-2 py-8">
        <chats.UserProvider>{target}</chats.UserProvider>
      </chats.ListProvider>
    </div>
  );
};

export const ChatTable = (props: { userId: DBUser["id"] }) => {
  const data = useDbPagination(
    getActions({
      type: "userId",
      userId: props.userId,
    }),
    {
      pageNo: 0,
      pageSize: 20,
    },
    [props.userId],
  );

  const scroll = usePerfectScrollbar([props.userId]);
  return (
    <div className="h-full flex flex-col">
      <div ref={scroll.ref} className="perfect-scrollbar">
        <chats.ListProvider
          data={data.value?.target || []}
          className="flex flex-col gap-2 py-6 px-2">
          <TypeFlat />
        </chats.ListProvider>
      </div>
      <div className="flex justify-between border-t-2 items-center select-none">
        <div className="flex">
          <button
            className="btn btn-ghost btn-xs"
            onClick={data.prev}
            disabled={!data.value?.hasPrev}>
            prev
          </button>
          <p>&nbsp;</p>
          <button
            className="btn btn-ghost btn-xs"
            onClick={data.next}
            disabled={!data.value?.hasNext}>
            next
          </button>
        </div>
        <div className="px-2 py-1 text-right">総コメント数:{data.value?.count}</div>
      </div>
    </div>
  );
};

type ActionType =
  | {
      type: "timestamp";
      from?: Date;
      to?: Date;
      limit?: number;
    }
  | {
      type: "userId";
      userId: DBUser["id"];
      limit?: number;
    };

export const getActions = (props: ActionType) => {
  switch (props.type) {
    case "timestamp": {
      const between = {
        from: Number(props.from || dayjs(new Date()).subtract(10, "day").toDate()),
        to: Number(props.to || dayjs(new Date()).add(10, "day").toDate()),
      };
      const query = {
        where: "timestamp",
        from: between.from,
        to: between.to,
      };
      const result = db.actions.where(query.where).between(query.from, query.to);
      if (props.limit == null) return result;
      return result.limit(props.limit);
    }
    case "userId": {
      const result = db.actions.where("userId").equals(props.userId).reverse();
      if (props.limit == null) return result;
      return result.limit(props.limit);
    }
    default:
      throw new Error("");
  }
};
