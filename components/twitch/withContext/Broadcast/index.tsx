import {
  ChangeEventHandler,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { TWITCH_CONSTANTS } from "@constants/twitch";
import { zodResolver } from "@hookform/resolvers/zod";
import { DBBroadcast, DBBroadcastSchema } from "@schemas/twitch/Broadcast";
import { DBGame } from "@schemas/twitch/Game";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { db, DbBroadcastTemplate } from "@resource/db";
import { deleteBroadcastTemplate, updateBroadcastTemplate } from "@resource/twitchWithDb";
import { TwitchAPI } from "@libs/twitch";

import { useDialog } from "@components/commons/Dialog";
import { DasyBadge } from "@components/dasyui/Badge";
import { MultiTag } from "@components/hookForm/MultiTag";
import { Game } from "../Game";
import { ContextElements, createSpan, createTime } from "../interface";

/**
 * viewer
 */
const { BROADCAST_LANGUAGE, CLASSIFICATION_LABELS } = TWITCH_CONSTANTS;

const boroadcastContext = createContext<DbBroadcastTemplate | undefined | null>(null);
const useBroadcastTemplate = () => useContext(boroadcastContext);
const Provider = (props: { data?: DbBroadcastTemplate; children: ReactNode }) => {
  return (
    <boroadcastContext.Provider value={props.data}>{props.children}</boroadcastContext.Provider>
  );
};

const Title = createSpan(useBroadcastTemplate, ["broadcastTitle"]);
const CreatedAt = createTime(useBroadcastTemplate, ["createdAt"]);
const UpdatedAt = createTime(useBroadcastTemplate, ["updateAt"]);

const Language = (props: ContextElements["Span"]) => {
  const template = useBroadcastTemplate();
  const lang = BROADCAST_LANGUAGE.find((val) => val.id === template?.language)?.name;
  if (lang == null) return <span {...props} />;
  return <span {...props}>{lang}</span>;
};

const Favorite = (props: ContextElements["Input"]) => {
  const template = useBroadcastTemplate();
  const handleFavorite: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (template?.id == null) throw new Error("not found props id");
      updateBroadcastTemplate(template.id, {
        favorite: e.currentTarget.checked,
      });
    },
    [template],
  );
  if (template?.favorite == null) return <input {...props} type="checkbox" className="favorite" />;
  return (
    <input
      {...props}
      type="checkbox"
      defaultChecked={template.favorite}
      className="favorite text-outline"
      onInput={handleFavorite}
    />
  );
};

const TagBadge = (props: ContextElements["Ul"]) => {
  const template = useBroadcastTemplate();
  return (
    <ul {...props}>
      {template?.tags.slice(0, 2).map((val) => (
        <DasyBadge size="badge-sm" outline key={val}>
          {val}
        </DasyBadge>
      ))}
      {(template?.tags.length || 0) > 2 ? <li className="text-caption">...</li> : null}
    </ul>
  );
};

const Apply = (props: ContextElements["Button"]) => {
  const apply = useApply();
  return (
    <button className="btn btn-sm btn-accent" onClick={apply} {...props} type="button">
      適用
    </button>
  );
};
const Delete = (props: ContextElements["Button"]) => {
  const deleteTemplate = useDelete();
  return (
    <button className="btn btn-sm btn-ghost" onClick={deleteTemplate} {...props} type="button">
      削除
    </button>
  );
};
const Edit = (props: ContextElements["Button"]) => {
  const edit = useEdit();
  return (
    <button className="btn btn-sm" onClick={edit} {...props} type="button">
      編集
    </button>
  );
};
const Create = (props: ContextElements["Button"]) => {
  const create = useCreate({ isNew: true });
  return (
    <button className="btn btn-sm" onClick={create} {...props} type="button">
      作成
    </button>
  );
};
const Copy = (props: ContextElements["Button"]) => {
  const create = useCreate();
  return (
    <button className="btn btn-sm" onClick={create} {...props} type="button">
      複製
    </button>
  );
};
/**
 * dialogとか挟んだほうが吉
 */
const useApply = () => {
  const template = useBroadcastTemplate();
  const dialog = useDialog();
  return useCallback(async () => {
    dialog.open({
      title: "配信に適用しますか？",
      onSuccess: async () => {
        const me = await db.getMe();
        if (template == null || me?.id == null) return;
        await TwitchAPI.channels_patch({
          parameters: {
            broadcaster_id: me.id,
          },
          requestBody: {
            game_id: template.gameId,
            broadcaster_language: template.language,
            title: template.broadcastTitle,
            tags: template.tags,
            // TODO: classification labels の訂正
            // content_classification_labels: template.classificationLabels,
            is_branded_content: template.isBrandedContent,
          },
        });
        dialog.open({
          title: '適用完了',
          successText: 'OK',
          nofail: true,
        })
      },
    });
  }, [template]);
};
const useDelete = () => {
  const template = useBroadcastTemplate();
  const dialog = useDialog();

  return useCallback(async () => {
    dialog.open({
      title: "このテンプレートを削除しますか？",
      onSuccess: async () => {
        if (template?.id == null) return;
        await deleteBroadcastTemplate([template.id]);
      },
    });
  }, [template]);
};
const useEdit = () => {
  const template = useBroadcastTemplate();
  const router = useRouter();
  return useCallback(() => {
    // qsで置き換え
    router.push(`/games/edit?templateId=${template?.id}`);
  }, [template, router]);
};

// broadcastHistoryId
const useCreate = (
  props: {
    isNew?: boolean;
    isHistory?: boolean;
  } = {},
) => {
  const template = useBroadcastTemplate();
  const router = useRouter();
  return useCallback(() => {
    if (props.isNew) {
      router.push("/games/create");
      return;
    }
    // qsで置き換え
    if (props.isHistory) {
      router.push(`/games/create?broadcastHistoryId=${template?.id}`);
    } else {
      router.push(`/games/create?templateId=${template?.id}`);
    }
  }, [template, router]);
};
/**
 * edit
 */
const BroadcastFormProvider = (
  props: {
    children: ReactNode;
    onSubmit: (value: DBBroadcast) => void;
  } & ContextElements["Form"],
) => {
  const { children, onSubmit } = props;
  const template = useBroadcastTemplate();
  const methods = useForm<DBBroadcast>({
    mode: "onChange",
    defaultValues: {
      tags: [],
      ...template,
    },
    resolver: zodResolver(DBBroadcastSchema),
  });
  return (
    <FormProvider {...methods}>
      <form className="w-full h-full" {...props} onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
      </form>
    </FormProvider>
  );
};

const useBroadcastFormContext = () => useFormContext<DBBroadcast>();
const EditTitle = () => {
  const context = useBroadcastFormContext();

  return (
    <div className="inline-flex flex-col">
      <input
        className="input input-bordered w-full max-w-xs"
        type="text"
        {...context.register("broadcastTitle")}
      />
      <p className="text-error select-none">
        {context.formState.errors.broadcastTitle?.message} &nbsp;
      </p>
    </div>
  );
};
const EditLanguage = () => {
  const { register } = useBroadcastFormContext();
  return (
    <select className="select select-bordered max-w-xs" {...register("language")}>
      <option disabled>選択言語</option>
      {BROADCAST_LANGUAGE.map((val) => (
        <option key={val.id} value={val.id}>
          {val.name}
        </option>
      ))}
    </select>
  );
};
const EditBrandedContents = () => {
  const { register } = useBroadcastFormContext();
  return <input type="checkbox" className="ios-toggle" {...register("isBrandedContent")} />;
};
const EditTags = () => {
  const context = useBroadcastFormContext();
  return (
    <div className="inline-flex flex-col">
      <MultiTag control={context.control} name="tags" />
      <p className="text-error select-none">{context.formState.errors.tags?.message} &nbsp;</p>
    </div>
  );
};
const EditClassificationLabels = () => {
  const { register } = useBroadcastFormContext();
  // TODO: 要デバッグ
  return (
    <>
      {CLASSIFICATION_LABELS.map((val) => (
        <div key={val.id} className=" inline-flex gap-2 justify-center">
          <input
            key={val.id}
            type="checkbox"
            value={val.id}
            {...register("classificationLabels")}
          />
          <span>{val.description}</span>
        </div>
      ))}
    </>
  );
};

const EditGame = () => {
  const { setValue, getValues } = useBroadcastFormContext();
  const [game, setGame] = useState<string | undefined>(getValues("gameId"));
  return (
    <Game.Input
      value={game}
      onChange={(e) => {
        setValue("gameId", e.currentTarget.value);
        setGame(e.currentTarget.value);
      }}
    />
  );
};

/**
 * with provider
 */
const ApplyGameProvider = (props: {
  Provider: (props: { id?: DBGame["id"]; children?: ReactNode }) => ReactNode;
  children: ReactNode;
}) => {
  const template = useBroadcastTemplate();
  return <props.Provider id={template?.gameId}>{props.children}</props.Provider>;
};
export const Broadcast = {
  Provider,
  Title,
  TagBadge,
  Language,
  CreatedAt,
  UpdatedAt,
  Favorite,
  Apply,
  Edit,
  Create,
  Delete,
  Copy,
  uses: {
    useApply,
    useDelete,
    useEdit,
    useCreate,
  },
  ApplyGameProvider,
  editor: {
    BroadcastFormProvider,
    Title: EditTitle,
    Language: EditLanguage,
    BrandedContents: EditBrandedContents,
    ClassificationLables: EditClassificationLabels,
    Tags: EditTags,
    Game: EditGame,
  },
};
