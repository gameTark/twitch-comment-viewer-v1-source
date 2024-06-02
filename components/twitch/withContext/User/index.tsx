import {
  ChangeEventHandler,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { DBUser } from "@schemas/twitch/User";
import { useLiveQuery } from "dexie-react-hooks";

import { IMAGES } from "@resource/constants";
import { db } from "@resource/db";
import { TwitchAPI } from "@libs/twitch";
import { UserDataLoader } from "@libs/user";
import { useAsyncMemo } from "@libs/uses";

import { ICONS } from "@components/icons";
import { ContextElements, createImg, createSpan, createTime } from "../interface";

const userContext = createContext<DBUser | undefined | null>(null);
const useUser = () => useContext(userContext);

const user = new UserDataLoader();

const Provider = (props: { id?: DBUser["id"] | null; children: ReactNode }) => {
  // const userCtx = useUserContext();
  const data = useLiveQuery(async () => {
    if (props.id == null) return;
    return await user.load(props.id);
    // return await userCtx.fetchById(props.id);
  }, [props.id]);

  return <userContext.Provider value={data}>{props.children}</userContext.Provider>;
};

const Name = createSpan(useUser, ["displayName", "login"], {
  children: ".........",
});
const Id = createSpan(useUser, ["id"], {
  children: ".........",
});
const Description = createSpan(useUser, ["description"], {
  children: ".........",
});
const MetaComment = createSpan(useUser, ["metaComment"], {
  children: ".........",
});
const CreatedAt = createTime(useUser, ["createdAt"], {
  children: "....",
});
const UpdateAt = createTime(useUser, ["updateAt"], {
  children: "....",
});
const ProfileImage = createImg(
  useUser,
  {
    src: ["profileImageUrl"],
    alt: ["login"],
  },
  IMAGES.PROFILE_404,
  {
    className: "inline-block aspect-square select-none",
  },
);

const OfflineImage = createImg(
  useUser,
  {
    src: ["offlineImageUrl"],
    alt: ["login"],
  },
  IMAGES.NONE,
  {
    className: "inline-block aspect-square select-none",
  },
);
const useTiwtchUpdateUserById = (id?: string) => {
  const updateUser = useCallback(
    async (user: Partial<DBUser>) => {
      if (id == null) return;
      const result = await db.users.update(id, user);
      return result;
    },
    [id],
  );
  return updateUser;
};
const useUpdateUser = () => {
  const user = useUser();
  const update = useTiwtchUpdateUserById(user?.id);
  return update;
};

const EditableMetaComment = (props: ContextElements["TextArea"]) => {
  const user = useUser();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [bio, setBio] = useState<string>("");
  const update = useTiwtchUpdateUserById(user?.id);

  useEffect(() => {
    if (user == null || ref.current == null) return;
    setBio(user.metaComment || "");
    ref.current.value = user.metaComment || "";
  }, [user?.id]);

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
      ref={ref}></textarea>
  );
};

const FollowerCount = () => {
  const user = useUser();
  const counts = useAsyncMemo(async () => {
    if (user?.id == null) return;
    const result = await TwitchAPI.channels_followers_get({
      parameters: {
        broadcaster_id: user.id,
      },
    });
    return result.total || 0;
  }, [user?.id]);
  return <span>{counts ?? "..."}</span>;
};

const TwitchLink = (props: ContextElements["Anchor"]) => {
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
  useUpdateUser,
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
