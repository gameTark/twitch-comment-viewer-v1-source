import {
  ChangeEventHandler,
  createContext,
  DetailedHTMLProps,
  HTMLAttributes,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DBUser } from "@schemas/twitch/User";
import { useLiveQuery } from "dexie-react-hooks";

import { useTiwtchUpdateUserById } from "@resource/twitchWithDb";
import { useUserContext } from "@contexts/twitch/userContext";
import { dayjs } from "@libs/dayjs";
import { fetchChannelFollowers } from "@libs/twitch";
import { useAsyncMemo } from "@libs/uses";

import { ICONS } from "@components/icons";

const userContext = createContext<DBUser | undefined | null>(null);
const useUser = () => useContext(userContext);

const Provider = (props: { id?: DBUser["id"] | null; children: ReactNode }) => {
  const userCtx = useUserContext();
  const data = useLiveQuery(async () => {
    if (props.id == null) return;
    return await userCtx.fetchById(props.id);
  }, [props.id]);

  return <userContext.Provider value={data}>{props.children}</userContext.Provider>;
};

const Name = (props: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>) => {
  const user = useUser();
  return <span {...props}>{user?.displayName || user?.login}</span>;
};
const Id = (props: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>) => {
  const user = useUser();
  return <span {...props}>{user?.id}</span>;
};
const Description = (
  props: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>,
) => {
  const user = useUser();
  return <span {...props}>{user?.description}</span>;
};
const MetaComment = (
  props: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>,
) => {
  const user = useUser();
  return <span {...props}>{user?.metaComment}</span>;
};

const ProfileImage = (
  props: Omit<
    Omit<DetailedHTMLProps<HTMLAttributes<HTMLImageElement>, HTMLImageElement>, "src">,
    "alt"
  >,
) => {
  const user = useUser();
  return <img {...props} src={user?.profileImageUrl} alt={user?.login} />;
};
const OfflineImage = (
  props: Omit<
    Omit<DetailedHTMLProps<HTMLAttributes<HTMLImageElement>, HTMLImageElement>, "src">,
    "alt"
  >,
) => {
  const user = useUser();
  return <img {...props} src={user?.offlineImageUrl} alt={user?.login} />;
};

const UpdateAt = (
  props: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> & {
    format?: string;
  },
) => {
  const game = useUser();
  return (
    <span {...props}>{dayjs(game?.updateAt).format(props.format || "YYYY/MM/DD hh:mm:ss")}</span>
  );
};
const CreatedAt = (
  props: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> & {
    format?: string;
  },
) => {
  const game = useUser();
  return (
    <span {...props}>{dayjs(game?.createdAt).format(props.format || "YYYY/MM/DD hh:mm:ss")}</span>
  );
};

type TypeTextarea = DetailedHTMLProps<HTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;

const EditableMetaComment = (props: TypeTextarea) => {
  const user = useUser();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [bio, setBio] = useState<string>("");
  const update = useTiwtchUpdateUserById(user?.id);

  useEffect(() => {
    if (user == null || ref.current == null) return;
    console.log(user.metaComment);
    setBio(user.metaComment);
    ref.current.value = user.metaComment || "";
  }, [user?.id])

  const updateUserInfo: ChangeEventHandler<HTMLTextAreaElement> = useCallback((e) => {
    setBio(e.currentTarget.value);
    update({
      metaComment: e.currentTarget.value,
    });
    props.onChange && props.onChange(e);
  }, []);
  return (
    <textarea
      className="textarea textarea-bordered leading-4"
      placeholder="Bio"
      rows={6}
      {...props}
      onChange={updateUserInfo}
      defaultValue={bio}
      ref={ref}
    ></textarea>
  );
};

const FollowerCount = () => {
  const user = useUser();
  const counts = useAsyncMemo(async () => {
    if (user?.id == null) return;
    const result = await fetchChannelFollowers({
      broadcaster_id: user.id,
    });
    return result.total;
  }, []);
  return <span>{counts || "..."}</span>;
};

type TypeAnchor = DetailedHTMLProps<HTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;

const TwitchLink = (props: TypeAnchor) => {
  const user = useUser();
  if (user == null) return;
  return (
    <a
      className="link link-info flex gap-1 py-2 items-center"
      {...props}
      target="__blank"
      href={`https://www.twitch.tv/${user.login}`}>
      Twitch {ICONS.EXTERNAL}
    </a>
  );
};

export const User = {
  Provider,
  Id,
  useUser,
  Name,
  ProfileImage,
  Description,
  UpdateAt,
  CreatedAt,
  MetaComment,
  EditableMetaComment,
  OfflineImage,
  FollowerCount,
  TwitchLink,
};
