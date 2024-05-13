import { useCallback } from "react";
import { DBUser } from "@schemas/twitch/User";

import { useModalContext } from "@components/dasyui/Modal";
import { ChatTable } from "./Chats";
import { Follower } from "./withContext/Follower";
import { User } from "./withContext/User";

export const useUserInfoModal = () => {
  const modal = useModalContext();
  const user = User.useUser();
  const openModal = useCallback((userId?: string) => {
    const id = userId || user?.id;
    if (id == null) return;
    modal.open(<UserInformation userId={id} />);
  }, [user]);
  return openModal;
};

const UserInformation = (props: { userId: DBUser["id"] }) => {
  return (
    <User.Provider id={props.userId}>
      <Follower.Provider id={props.userId}>
        <div className="flex flex-col gap-8">
          <div className="flex gap-6 content-stretch bg-cover">
            <div className="chat-image avatar dropdown dropdown-end select-none">
              <div className="w-40 rounded-full border">
                <User.ProfileImage />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p>
                名前: <User.Name />
              </p>
              <p>
                ID: <User.Id />
              </p>
              <p>
                フォロワー数: <User.FollowerCount />
              </p>
              <p>
                フォロー開始日: <Follower.FollowedAt format="YYYY/MM/DD" />
              </p>
              <div className="mt-auto select-none">
                <Follower.FollowedAt />
              </div>
            </div>
          </div>
          <div>
            <p>
              <User.TwitchLink />
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-black">BIO</p>
            <User.EditableMetaComment />
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-black">コメント一覧</p>
            <div className="h-56 border rounded-md">
              <ChatTable userId={props.userId} />
            </div>
          </div>
        </div>
      </Follower.Provider>
    </User.Provider>
  );
};
