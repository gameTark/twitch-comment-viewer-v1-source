import { ReactNode, useCallback } from "react";
import clsx from "clsx";

import { Image } from "@libs/types";

type Base = "chat-start" | "chat-end";
type ChatBubble = "chat-bubble";
type ChatBubbleModifire =
  | "chat-bubble-primary"
  | "chat-bubble-secondary"
  | "chat-bubble-accente"
  | "chat-bubble-info"
  | "chat-bubble-success"
  | "chat-bubble-warning"
  | "chat-bubble-error";
/**
 * https://daisyui.com/components/chat/
 */
export const ChatBubble = ({
  type,
  color,
  image,
  message,
  header,
  footer,
  onClickAvater,
}: {
  type?: Base;
  image?: Image;
  onClickAvater?: () => void;
  message: ReactNode;
  color?: ChatBubbleModifire;
  header?: ReactNode;
  footer?: ReactNode;
}) => {
  const _image =
    image == null ? null : (
      <div className="chat-image avatar cursor-pointer" onClick={onClickAvater}>
        <div className="w-10 rounded-full border-2">
          <img {...image} />
        </div>
      </div>
    );
  const _footer = footer == null ? null : <div className="chat-footer">{footer}</div>;
  const _header = header == null ? null : <div className="chat-header">{header}</div>;

  return (
    <div className={clsx("chat", type)}>
      {_image}
      {_header}
      <p className={clsx("chat-bubble", color)}>{message}</p>
      {_footer}
    </div>
  );
};

const createSpace = (num: number) => new Array(num).fill("　").join(" ");
export const ChatSkeleton = (props: {
  hasHeader?: boolean;
  hasFooter?: boolean;
  hasImage?: boolean;
}) => {
  return (
    <div className="chat chat-end">
      {props.hasImage && (
        <div className="chat-image">
          <div className="w-10 h-10 rounded-full skeleton"></div>
        </div>
      )}
      {props.hasHeader && <div className="chat-header skeleton">{createSpace(5)}</div>}
      <p className="chat-bubble skeleton">{createSpace(10)}</p>
      {props.hasFooter && <div className="chat-footer skeleton">{createSpace(3)}</div>}
    </div>
  );
};
