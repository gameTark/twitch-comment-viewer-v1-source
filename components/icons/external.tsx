import React from "react";

function ExternalIcon(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="21"
      fill="none"
      viewBox="0 0 21 21">
      <path
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.5 8.5v-5m0 0h-5m5 0l-7 7m-1-7h-5a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2v-4"></path>
    </svg>
  );
}

export default ExternalIcon;
