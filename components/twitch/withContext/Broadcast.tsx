import {
  ChangeEventHandler,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { DBBroadcast } from "@schemas/twitch/Broadcast";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { DbBroadcastTemplate, DbGame } from "@resource/db";
import { updateBroadcastTemplate } from "@resource/twitchWithDb";
import { BROADCAST_LANGUAGE, CLASSIFICATION_LABELS } from "@libs/twitch";

import { DasyBadge } from "@components/dasyui/Badge";
import { MultiTag } from "@components/hookForm/MultiTag";
import { Game } from "./Game";
import { ContextElements, createSpan, createTime } from "./interface";

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
      className="favorite"
      onInput={handleFavorite}
    />
  );
};

const TagBadge = () => {
  const template = useBroadcastTemplate();
  return template?.tags.map((val) => (
    <DasyBadge size="badge-sm" key={val}>
      {val}
    </DasyBadge>
  ));
};

const ApplyGameProvider = (props: {
  Provider: (props: { id?: DbGame["id"]; children?: ReactNode }) => ReactNode;
  children: ReactNode;
}) => {
  const template = useBroadcastTemplate();
  return <props.Provider id={template?.gameId}>{props.children}</props.Provider>;
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
    defaultValues: {
      ...template,
    },
  });
  return (
    <FormProvider {...methods}>
      <form {...props} onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
      </form>
    </FormProvider>
  );
};

const useBroadcastFormContext = () => useFormContext<DBBroadcast>();
const EditTitle = () => {
  const { register } = useBroadcastFormContext();
  return (
    <input
      className="input input-bordered w-full max-w-xs"
      type="text"
      {...register("broadcastTitle")}
    />
  );
};
const EditLanguage = () => {
  const { register } = useBroadcastFormContext();
  return (
    <select className=" select select-bordered" {...register("language")}>
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
  const { control } = useBroadcastFormContext();
  return <MultiTag control={control} name="tags" />;
};
const EditClassificationLabels = () => {
  const { register } = useBroadcastFormContext();
  // TODO: 要デバッグ
  return (
    <>
      {CLASSIFICATION_LABELS.map((val) => (
        <div className=" inline-flex gap-2 justify-center">
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

export const Broadcast = {
  Provider,
  Title,
  TagBadge,
  Language,
  CreatedAt,
  UpdatedAt,
  Favorite,
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
