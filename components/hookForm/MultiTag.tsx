import { ChangeEventHandler, useCallback, useRef, useState } from "react";
import { FieldValues, useController, UseControllerProps, useFieldArray } from "react-hook-form";

import { DasyBadge } from "@components/dasyui/Badge";
import { ICONS } from "@components/icons";

// TODO: 型情報の整備を行う
export const MultiTag = <TFieldValues extends FieldValues>(
  props: UseControllerProps<TFieldValues>,
) => {
  const { name, control, rules } = props;
  const controller = useController({
    name,
    control,
    rules,
  });
  const { fields, append, remove } = useFieldArray({
    name: name as any,
    control,
    rules: rules as any,
  });
  const [input, setInput] = useState("");
  const addTag = () => {
    if (input === "" || input == null) return;
    append(input as any);
    setInput("");
  };
  const removeTag = (index: number) => {
    remove(index);
  };

  const handleChangeInput: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInput(e.currentTarget.value);
  };

  return (
    <div className="inline-flex flex-col gap-2">
      <span className="inline-flex gap-2">
        <input
          className="input input-bordered w-64"
          type="text"
          value={input}
          onChange={handleChangeInput}
          disabled={props.disabled}
        />
        <button type="button" className="btn" onClick={addTag}>
          追加
        </button>
      </span>

      <ul className="flex gap-1 select-none flex-wrap">
        {fields.map((tag, index) => (
          <li key={tag.id}>
            <DasyBadge size="badge-lg" type="badge-ghost">
              <span className="flex items-center gap-1 whitespace-nowrap">
                {controller.field.value[index]}
                <input type="hidden" {...controller.field} />
                <label className="cursor-pointer" onClick={() => removeTag(index)}>
                  <ICONS.CROSS.SIZE size={15} />
                </label>
              </span>
            </DasyBadge>
          </li>
        ))}
      </ul>
    </div>
  );
};
