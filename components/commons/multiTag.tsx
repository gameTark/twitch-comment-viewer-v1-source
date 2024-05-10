import {
  ChangeEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { KEYBOARD } from "@resource/constants";

import { DasyBadge } from "@components/dasyui/Badge";
import { ICONS } from "@components/icons";

export const MultiTag = (props: {
  value: string;
  name?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) => {
  const refInput = useRef<HTMLInputElement>(null);
  const refItem = useRef(props.value || "");
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    refItem.current = props.value;
  }, [props.value]);

  const dispatch = useCallback((value: string) => {
    if (refInput.current == null) return;
    refInput.current.value = value;
    refInput.current.dispatchEvent(new Event("input", { bubbles: true }));
  }, []);

  const addTag = useCallback(
    (tag: string) => {
      const tagResult = tag.trim();
      if (tagResult === "") return;
      const prev = refItem.current.split(",");
      if (prev.includes(tagResult)) return;
      const result = [
        ...prev,
        ...tagResult
          .split(",")
          .map((val) => val.trim())
          .filter((val) => val !== ""),
      ].join(",");
      setInput("");

      dispatch(result);
      return result;
    },
    [dispatch],
  );

  const removeTag = useCallback(
    (targetTag?: string) => {
      if (targetTag == null) {
        const prev = refItem.current.split(",");
        const result = prev.slice(0, prev.length - 1).join(",");
        dispatch(result);
        return;
      }
      const prev = refItem.current.split(",");
      const result = prev.filter((tag) => tag !== targetTag).join(",");
      dispatch(result);
      return result;
    },
    [dispatch],
  );

  const handleInput: ChangeEventHandler<HTMLInputElement> = useCallback((changeEvent) => {
    setInput(changeEvent.currentTarget.value);
  }, []);

  const handleCloseInput: MouseEventHandler<HTMLInputElement> = useCallback((mouseEvent) => {
    removeTag(mouseEvent.currentTarget.value);
  }, []);

  const handleKeyboard: KeyboardEventHandler<HTMLInputElement> = useCallback((e) => {
    switch (e.key) {
      case KEYBOARD.ENTER:
        e.preventDefault();
        e.stopPropagation();
        addTag(e.currentTarget.value);
        return;
      // case KEYBOARD.BACKSPACE:
      //   if (e.currentTarget.value === "") removeTag();
      //   return;
    }
  }, []);
  const tags = useMemo(() => {
    return props.value.split(",").filter((val) => val !== "");
  }, [props.value]);

  const addButton = () => {
    addTag(input);
  };
  return (
    <div className="inline-flex flex-col gap-2">
      <span className="inline-flex gap-2">
        <input
          className="input input-bordered w-64"
          type="text"
          onKeyDown={handleKeyboard}
          onChange={handleInput}
          value={input}
        />
        <button className="btn" onClick={addButton}>
          追加
        </button>
      </span>

      <ul className="flex gap-1 select-none flex-wrap">
        {tags.map((tag) => (
          <li key={tag}>
            <DasyBadge size="badge-lg" type="badge-ghost">
              <span className="flex items-center gap-1 whitespace-nowrap">
                {tag}
                <label className="cursor-pointer">
                  <input type="button" className="hidden" value={tag} onClick={handleCloseInput} />
                  <ICONS.CROSS.SIZE size={15} />
                </label>
              </span>
            </DasyBadge>
          </li>
        ))}
      </ul>
      <input ref={refInput} name={props.name} type="hidden" onInput={props.onChange} />
    </div>
  );
};
