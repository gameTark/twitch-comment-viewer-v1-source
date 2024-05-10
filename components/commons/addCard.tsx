import { useCallback } from "react";

export const AddCard = (props: { onClick?: () => void }) => {
  const handleClick = useCallback(() => {
    if (props.onClick == null) return;
    props.onClick();
  }, [props.onClick]);
  return (
    <div
      className="
    w-full
    h-full
    flex
    items-center
    justify-center
    
    shadow-xl
    rounded-box
    border-2
    border-base-content
    
    bg-base-content
    bg-opacity-40
    transition
    
    cursor-pointer

    opacity-50
    hover:opacity-100
    "
      tabIndex={0}
      onClick={handleClick}>
      <div className="h-12 w-12 rounded-full bg-base-100 text-base-content flex items-center justify-center">
        <div className="text-4xl select-none">+</div>
      </div>
    </div>
  );
};
