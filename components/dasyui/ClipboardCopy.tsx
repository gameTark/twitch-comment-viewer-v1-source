import { useEffect, useState } from "react";
import clipboardCopy from "clipboard-copy";

const COPIED = "クリップボードにコピーしました。";

export function ClipboardCopy(props: { text: string; target: string }) {
  const [state, setState] = useState(props.target);

  useEffect(() => {
    if (state !== COPIED) return;
    setTimeout(() => {
      setState(props.target);
    }, 1000);
  }, [state, props.target]);
  return (
    <div className="tooltip tooltip-bottom" data-tip={state}>
      <button
        className="btn whitespace-nowrap"
        onClick={() => {
          setState(COPIED);
          clipboardCopy(props.target);
        }}>
        {props.text}
      </button>
    </div>
  );
}
