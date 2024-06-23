import { useCallback } from "react";

import { useModalContext } from "@components/dasyui/Modal";

export interface UseDialogProps {
  title: string;
  successText?: string;
  failText?: string;
  onSuccess?: () => Promise<void> | void;
  onFail?: () => Promise<void> | void;
  nofail?: boolean; // TODO: Dialogではなく、Modalのタイプを定義する
}

const DialogContent = (props: UseDialogProps) => {
  return (
    <div className="flex flex-col gap-10 px-8 py-4 select-none">
      <p className="text-large text-center">{props.title}</p>
      <div className="flex gap-2 justify-center">
        <button className="btn btn-success" onClick={props.onSuccess}>
          {props.successText || "はい"}
        </button>
        {props.nofail ? null : (
          <button className="btn btn-ghost" onClick={props.onFail}>
            {props.failText || "いいえ"}
          </button>
        )}
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
export const useAsyncDialog = () => {
  const modal = useModalContext();
  const open = useCallback((props: UseDialogProps) => {
    const { onSuccess, onFail, ..._props } = props;
    const handleOpen = async () => {
      onSuccess && (await onSuccess());
      modal.close();
      // TODO: catch処理
    };
    const handleClose = async () => {
      onFail && (await onFail());
      modal.close();
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
