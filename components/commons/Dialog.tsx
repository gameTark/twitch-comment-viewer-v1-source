import { useCallback } from "react";

import { useModalContext } from "@components/dasyui/Modal";

export interface UseDialogProps {
  title: string;
  successText?: string;
  failText?: string;
  onSuccess?: () => void;
  onFail?: () => void;
}

const DialogContent = (props: UseDialogProps) => {
  return (
    <div className="flex flex-col gap-10 px-8 py-4">
      <p className="text-large text-center">{props.title}</p>
      <div className="flex gap-2 justify-center">
        <button className="btn btn-error text-base-content" onClick={props.onFail}>
          {props.failText || "いいえ"}
        </button>
        <button className="btn btn-success" onClick={props.onSuccess}>
          {props.successText || "はい"}
        </button>
      </div>
    </div>
  );
};

export const useDialog = () => {
  const modal = useModalContext();
  const open = useCallback((props: UseDialogProps) => {
    const { onSuccess, onFail, ..._props } = props;
    const handleOpen = () => {
      modal.close();
      if (onSuccess == null) return;
      onSuccess();
    };
    const handleClose = () => {
      modal.close();
      if (onFail == null) return;
      onFail();
    };

    modal.open(<DialogContent {..._props} onFail={handleClose} onSuccess={handleOpen} />);
  }, []);
  const close = useCallback(() => {
    modal.close();
  }, []);
  return {
    open,
    close,
  };
};
