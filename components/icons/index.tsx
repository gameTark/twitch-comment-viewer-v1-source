export const ICONS = {
  DATABASE: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      className="fill-current"
      viewBox="0 0 24 24">
      <path d="M12 20c-2.337 0-4.255-.298-5.753-.893C4.749 18.512 4 17.745 4 16.807V7c0-.83.78-1.538 2.34-2.123C7.9 4.292 9.787 4 12 4s4.1.292 5.66.877C19.22 5.462 20 6.169 20 7v9.808c0 .937-.749 1.703-2.247 2.299-1.498.596-3.416.894-5.753.893zm0-11.11a16.3 16.3 0 004.33-.599c1.456-.4 2.327-.834 2.612-1.305-.273-.496-1.13-.951-2.57-1.365A15.749 15.749 0 0012 5c-1.453 0-2.908.2-4.366.599-1.458.4-2.33.836-2.615 1.31.272.5 1.13.955 2.576 1.366A16.04 16.04 0 0012 8.89zm0 5.033c.687 0 1.362-.033 2.025-.1a16.917 16.917 0 001.901-.297 11.973 11.973 0 001.685-.491c.52-.196.982-.418 1.389-.665V8.275a8.42 8.42 0 01-1.39.664 11.8 11.8 0 01-1.684.49c-.605.132-1.238.231-1.901.298a20.22 20.22 0 01-4.104-.01 18.148 18.148 0 01-1.906-.306 12.2 12.2 0 01-1.663-.482A7.417 7.417 0 015 8.275v4.096c.391.247.842.465 1.352.654.51.19 1.064.35 1.663.482.597.131 1.233.234 1.906.307.673.073 1.366.11 2.079.109zM12 19c.857 0 1.671-.049 2.443-.146a13.611 13.611 0 002.082-.414c.616-.179 1.14-.392 1.57-.641.43-.249.732-.517.905-.805v-3.623c-.407.247-.87.468-1.39.664-.518.196-1.08.36-1.684.491-.605.131-1.238.23-1.901.297a20.211 20.211 0 01-4.104-.01 18.132 18.132 0 01-1.906-.306 12.2 12.2 0 01-1.663-.482A7.242 7.242 0 015 13.371V17c.173.301.474.572.903.812.429.24.95.449 1.566.627.615.178 1.31.316 2.085.415.775.099 1.59.147 2.446.146z"></path>
    </svg>
  ),
  CROSS: {
    MD: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        className="stroke-current"
        viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M6 6l12 12m0-12L6 18"></path>
      </svg>
    ),
    SIZE: (props: { size: number }) => {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          style={{ width: props.size }}
          className="stroke-current"
          viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M6 6l12 12m0-12L6 18"></path>
        </svg>
      );
    },
  },
  SEARCH: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      className="fill-current"
      viewBox="0 0 24 24">
      <path d="M19.485 20.154l-6.262-6.262c-.5.426-1.075.756-1.725.989-.65.233-1.303.35-1.96.35-1.601 0-2.957-.554-4.066-1.663-1.11-1.109-1.664-2.464-1.664-4.065 0-1.601.554-2.957 1.662-4.067 1.108-1.11 2.463-1.666 4.064-1.667 1.601-.001 2.957.553 4.068 1.664 1.11 1.11 1.666 2.466 1.666 4.067 0 .695-.123 1.367-.369 2.017a5.474 5.474 0 01-.97 1.668l6.262 6.261-.706.708zM9.539 14.23c1.327 0 2.447-.457 3.36-1.37.913-.913 1.37-2.034 1.37-3.361 0-1.327-.457-2.447-1.37-3.36-.913-.913-2.033-1.37-3.36-1.37s-2.447.456-3.361 1.37c-.914.914-1.37 2.034-1.37 3.36s.457 2.446 1.37 3.36c.913.914 2.033 1.37 3.36 1.37"></path>
    </svg>
  ),
  EXTERNAL: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="21"
      fill="none"
      className="stroke-current"
      viewBox="0 0 21 21">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.5 8.5v-5m0 0h-5m5 0l-7 7m-1-7h-5a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2v-4"></path>
    </svg>
  ),
  TODO: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      className="stroke-current fill-current"
      viewBox="0 0 24 24">
      <g clipPath="url(#clip0_193_39)">
        <path d="M7.27 0a.923.923 0 00-.606.346L3.519 4.298 1.442 2.913A.936.936 0 10.404 4.471l2.77 1.847a.923.923 0 001.24-.203L8.106 1.5A.923.923 0 007.27 0zm3.807 2.77v1.845H24V2.77H11.077zM7.269 8.307a.923.923 0 00-.605.346l-3.145 3.951-2.077-1.384a.936.936 0 00-1.039 1.558l2.77 1.846a.923.923 0 001.24-.202l3.693-4.615a.923.923 0 00-.837-1.5zm3.808 2.769v1.846H24v-1.846H11.077zm-3.808 5.538a.923.923 0 00-.605.347l-3.145 3.951-2.077-1.384a.935.935 0 10-1.039 1.558l2.77 1.846a.923.923 0 001.24-.202l3.693-4.616a.923.923 0 00-.837-1.5zm3.808 2.77v1.846H24v-1.846H11.077z"></path>
      </g>
      <defs>
        <clipPath id="clip0_193_39">
          <path d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  ),
  REWARD: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      className="stroke-current fill-current"
      viewBox="0 0 24 24">
      <path d="M14.3 21.7c-.7.2-1.5.3-2.3.3-5.5 0-10-4.5-10-10S6.5 2 12 2c1.3 0 2.6.3 3.8.7l-1.6 1.6c-.7-.2-1.4-.3-2.2-.3-4.4 0-8 3.6-8 8s3.6 8 8 8c.4 0 .9 0 1.3-.1.2.7.6 1.3 1 1.8zM7.9 10.1l-1.4 1.4L11 16 21 6l-1.4-1.4-8.6 8.6-3.1-3.1zM18 14v3h-3v2h3v3h2v-3h3v-2h-3v-3h-2z"></path>
    </svg>
  ),
  EYE: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      className="stroke-current"
      viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M3 13c3.6-8 14.4-8 18 0M12 17a3 3 0 110-6 3 3 0 010 6z"></path>
    </svg>
  ),
  GEAR: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      className="fill-current"
      viewBox="0 0 24 24">
      <path d="M17.3 10.453l1.927.315a.327.327 0 01.273.322v1.793a.326.326 0 01-.27.321l-1.93.339c-.111.387-.265.76-.459 1.111l1.141 1.584a.326.326 0 01-.034.422l-1.268 1.268a.326.326 0 01-.418.037l-1.6-1.123c-.354.197-.73.354-1.118.468l-.34 1.921a.326.326 0 01-.322.269H11.09a.325.325 0 01-.321-.272l-.319-1.911a5.498 5.498 0 01-1.123-.465l-1.588 1.113a.326.326 0 01-.418-.037L6.052 16.66a.327.327 0 01-.035-.42l1.123-1.57a5.499 5.499 0 01-.47-1.129l-1.901-.337a.326.326 0 01-.269-.321V11.09c0-.16.115-.296.273-.322l1.901-.317c.115-.393.272-.77.47-1.128l-1.11-1.586a.326.326 0 01.037-.417L7.34 6.053a.326.326 0 01.42-.035l1.575 1.125a5.46 5.46 0 011.121-.46l.312-1.91a.327.327 0 01.322-.273h1.793c.159 0 .294.114.322.27l.336 1.92c.389.112.764.268 1.12.465l1.578-1.135a.326.326 0 01.422.033l1.268 1.268a.326.326 0 01.036.418L16.84 9.342c.193.352.348.724.46 1.11v.001zM9.716 12a2.283 2.283 0 104.566 0 2.283 2.283 0 00-4.566 0z"></path>
    </svg>
  ),
  GAME: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      className="fill-current"
      viewBox="0 0 24 24">
      <g clipPath="url(#clip0_167_45)">
        <path
          fillRule="evenodd"
          d="M17 4c.763 0 1.394.434 1.856.89.481.473.922 1.109 1.314 1.81.787 1.406 1.472 3.243 1.925 5.058.45 1.801.699 3.682.54 5.161C22.475 18.404 21.71 20 20 20c-1.476 0-2.652-.76-3.614-1.531l-.351-.289-.492-.415-.444-.368C14.08 16.572 13.175 16 12 16c-1.175 0-2.08.572-3.099 1.397l-.444.368-.492.415-.35.289C6.651 19.24 5.475 20 4 20c-1.711 0-2.476-1.596-2.635-3.081-.158-1.48.09-3.36.54-5.161.453-1.815 1.138-3.652 1.925-5.059.392-.7.833-1.336 1.314-1.81C5.606 4.434 6.237 4 7 4c.515 0 1.018.123 1.513.27l.592.181c.099.03.197.06.295.087.865.248 1.75.462 2.6.462.85 0 1.735-.214 2.6-.462l.885-.267C15.983 4.124 16.49 4 17 4zm0 2c-.383 0-.783.116-1.171.243l-.458.151a7.269 7.269 0 01-.221.068c-.885.252-2 .538-3.15.538s-2.265-.286-3.15-.538l-.22-.068-.459-.151C7.783 6.115 7.383 6 7 6c-.418.078-.793.585-1.076 1.055l-.158.275-.19.346c-.682 1.218-1.31 2.88-1.73 4.567-.395 1.576-.587 3.086-.514 4.21l.026.293.02.176.03.208c.069.401.218.87.592.87.812 0 1.49-.404 2.333-1.074l.403-.328.76-.636.344-.28C8.904 14.839 10.235 14 12 14c1.765 0 3.096.84 4.16 1.682l.345.28.76.636.402.328C18.51 17.596 19.187 18 20 18c.34 0 .494-.387.571-.759l.038-.218.037-.317c.123-1.146-.067-2.765-.491-4.463-.386-1.546-.946-3.072-1.562-4.254l-.359-.66-.158-.273C17.793 6.585 17.418 6.078 17 6zM8.5 8a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm7 0a1 1 0 01.993.883L16.5 9v.5h.5a1 1 0 01.117 1.993L17 11.5h-.5v.5a1 1 0 01-1.993.117L14.5 12v-.5H14a1 1 0 01-.117-1.993L14 9.5h.5V9a1 1 0 011-1zm-7 2a.5.5 0 100 1 .5.5 0 000-1z"
          clipRule="evenodd"></path>
      </g>
    </svg>
  ),
  BROADCAST: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      className="fill-current"
      viewBox="0 0 24 24">
      <path d="M4.929 2.929l1.414 1.414A7.975 7.975 0 004 10c0 2.21.895 4.21 2.343 5.657L4.93 17.07A9.968 9.968 0 012 10a9.969 9.969 0 012.929-7.071zm14.142 0A9.967 9.967 0 0122 10a9.971 9.971 0 01-2.929 7.071l-1.414-1.414A7.972 7.972 0 0020 10c0-2.21-.895-4.21-2.343-5.657l1.414-1.414zM7.757 5.757l1.415 1.415A3.987 3.987 0 008 10c0 1.105.448 2.105 1.172 2.829l-1.415 1.414A5.982 5.982 0 016 10c0-1.657.672-3.157 1.757-4.243zm8.486 0A5.982 5.982 0 0118 10a5.983 5.983 0 01-1.757 4.243l-1.415-1.415A3.988 3.988 0 0016 10a3.986 3.986 0 00-1.172-2.828l1.415-1.415zM12 12a2 2 0 110-4 2 2 0 010 4zm-1 2h2v8h-2v-8z"></path>
    </svg>
  ),
  NOTIFICATION: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      className="fill-current"
      viewBox="0 0 24 24">
      <path d="M12 2a7 7 0 00-7 7v3.528a1 1 0 01-.105.447l-1.717 3.433A1.1 1.1 0 004.162 18h15.676a1.1 1.1 0 00.984-1.592l-1.716-3.433a1 1 0 01-.106-.447V9a7 7 0 00-7-7zm0 19a3.002 3.002 0 01-2.83-2h5.66A3 3 0 0112 21z"></path>
    </svg>
  ),
  TWITTER: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="fill-current">
      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
    </svg>
  ),
  YOUTUBE: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="fill-current">
      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
    </svg>
  ),
  FACEBOOK: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="fill-current">
      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
    </svg>
  ),
  INFORMATION: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className="stroke-info shrink-0 w-6 h-6">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  ),
  FOLLOW: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      className="fill-current"
      viewBox="0 0 24 24">
      <g clipPath="url(#clip0_158_48)">
        <path
          fillRule="evenodd"
          d="M16 14a5 5 0 015 5v2a1 1 0 01-2 0v-2a3 3 0 00-3-3H8a3 3 0 00-3 3v2a1 1 0 11-2 0v-2a5 5 0 015-5h8zm5.414-4.919a1 1 0 011.498 1.32l-.084.095L20 13.324a1 1 0 01-1.32.083l-.094-.083-1.414-1.414a1 1 0 011.32-1.498l.094.083.707.708 2.121-2.122zM12 2a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6z"
          clipRule="evenodd"></path>
      </g>
      <defs>
        <clipPath id="clip0_158_48">
          <path fill="#fff" d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  ),
  COMMENT: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      className="fill-current"
      viewBox="0 0 24 24">
      <path d="M6.5 13.5h7v-1h-7v1zm0-3h11v-1h-11v1zm0-3h11v-1h-11v1zM3 20.077V4.615c0-.46.154-.844.463-1.152A1.562 1.562 0 014.615 3h14.77c.46 0 .844.154 1.152.463.309.308.463.692.463 1.152v10.77c0 .46-.154.844-.462 1.153a1.567 1.567 0 01-1.153.462H6.077L3 20.077zM5.65 16h13.735a.59.59 0 00.423-.192.59.59 0 00.192-.423V4.615a.59.59 0 00-.192-.423.59.59 0 00-.423-.192H4.615a.59.59 0 00-.423.192.59.59 0 00-.192.423v13.03L5.65 16z"></path>
    </svg>
  ),
};
