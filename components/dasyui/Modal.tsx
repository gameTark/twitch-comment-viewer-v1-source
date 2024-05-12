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
import { DBUser } from "@schemas/twitch/User";

import { UserInformation } from "@components/twitch/User";
import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";

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
export const useShowUserInfoModal = () => {
  const modal = useModalContext();
  const open = useCallback(
    (userId: DBUser["id"]) => {
      modal.open(<UserInformation userId={userId} />);
    },
    [modal],
  );
  return {
    open,
  };
};

export const ModalProvider = (props: { children: ReactNode }) => {
  const [node, setNode] = useState<ReactNode | null>(null);
  const refDialog = useRef<HTMLDialogElement>(null);
  const scroll = usePerfectScrollbar([], {
    suppressScrollX: true,
  });

  const open = useCallback((node: ReactNode) => {
    setNode(node);
    refDialog.current?.showModal();
    scroll.refScroll.current?.update();
  }, []);
  const close = useCallback(() => {
    refDialog.current?.close();
  }, []);

  return (
    <>
      <modalContext.Provider value={{ open, close }}>{props.children}</modalContext.Provider>
      <dialog ref={refDialog} className="modal">
        <div className="modal-box perfect-scrollbar-nopadding h-min" ref={scroll.ref}>
          <div>{node}</div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};
