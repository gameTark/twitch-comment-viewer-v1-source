import { Scroll } from "@components/commons/PerfectScrollbar";
import { Stat } from "@components/dasyui/Stat";
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
export const FollowerStat = () => {
  return (
    <Stat
      title="フォロワー数 "
      value={
        <span>
          <Follower.FollowerCount />人
        </span>
      }
    />
  );
};
export function FollowerTable() {
  return (
    <Scroll className="w-full h-full">
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
    </Scroll>
  );
}
