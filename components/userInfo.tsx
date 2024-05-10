import { useTwitchGetByUserId } from "@resource/twitchWithDb";

// TODO: UserのURLへtarget __blankで飛べるようにする
// TODO: Userのモーダルとコンテキストを作る

export const UserInfo = (props: { userId: string }) => {
  const user = useTwitchGetByUserId(props.userId);
  // TODO: スケルトン実装
  if (user == null) return;

  return (
    <div>
      <h2>{user.displayName || user.login}</h2>
      <div className="avatar">
        <div className="w-12 rounded-full">
          <img src={user.profileImageUrl} alt={user.id} />
        </div>
      </div>
    </div>
  );
};

export const UserPage = (props: { userId: string }) => {
  const user = useTwitchGetByUserId(props.userId);
  if (user == null) return;
  return (
    <div>
      <div className="avatar">
        <div className="w-24 rounded-full">
          <img src={user.profileImageUrl} alt={user.id} />
        </div>
      </div>
    </div>
  );
};
