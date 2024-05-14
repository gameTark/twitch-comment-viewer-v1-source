import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";
import { useUserInfoModal } from "./UserInfo";
import { Follower } from "./withContext/Follower";
import { User } from "./withContext/User";

const Record = () => {
  const open = useUserInfoModal();
  return (
    <tr className="h-16 cursor-pointer select-none" onClick={() => open()} tabIndex={0}>
      <td>
        <div className="flex justify-center items-center">
          <User.ProfileImage className="rounded-full overflow-hidden w-10 border-2" />
        </div>
      </td>
      <td>
        <User.Name />
      </td>
      <td>
        <Follower.FollowedAt format="YYYY/MM/DD hh:mm:ss" className="whitespace-nowrap" />
      </td>
    </tr>
  );
};
export const FollowerTable = () => {
  const ps = usePerfectScrollbar([]);
  return (
    <div className=" perfect-scrollbar" ref={ps.ref}>
      <table className=" table table-pin-rows z-0 table-xs">
        <thead>
          <tr>
            <th className="w-16 text-center">画像</th>
            <th className="">名前</th>
            <th className="w-36 text-center">フォロー日</th>
          </tr>
        </thead>
        <Follower.RecordProvider>
          <Follower.UserProvider Povider={User.Provider}>
            <Record />
          </Follower.UserProvider>
        </Follower.RecordProvider>
      </table>
    </div>
  );
};
