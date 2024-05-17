"use client";

/**
modal	Component	Container element
modal-box	Component	The content of modal
modal-action	Component	Container for modal action buttons
modal-backdrop	Component	The backdrop that covers the back of modal so we can close the modal by clicking outside
modal-toggle	Component	For hidden checkbox that controls modal
modal-open	Modifier	Add/remove this class to open/close the modal using JS
modal-top	Responsive	Moves the modal to top
modal-bottom	Responsive	Moves the modal to bottom
modal-middle	Responsive	Moves the modal to middle (default)
 */
import { createContext, ReactNode, useCallback, useContext, useRef, useState } from "react";

import { Scroll } from "@components/commons/PerfectScrollbar";

interface ModalProps {}
interface ModalAction {
  open: (node: ReactNode) => void;
  close: () => void;
}
const modalContext = createContext<ModalProps & ModalAction>({
  open: () => {},
  close: () => {},
});

export const useModalContext = () => useContext(modalContext);

export const ModalProvider = (props: { children: ReactNode }) => {
  const [node, setNode] = useState<ReactNode | null>(null);
  const refDialog = useRef<HTMLDialogElement>(null);

  const open = useCallback((node: ReactNode) => {
    setNode(node);
    refDialog.current?.showModal();
  }, []);
  const close = useCallback(() => {
    refDialog.current?.close();
  }, []);

  return (
    <>
      <modalContext.Provider value={{ open, close }}>{props.children}</modalContext.Provider>
      <dialog ref={refDialog} className="modal">
        <Scroll className="modal-box perfect-scrollbar-nopadding h-min">
          <div>{node}</div>
        </Scroll>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};
