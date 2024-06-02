const Button = (
  <div className="inline-grid gap-2 grid-cols-4 grid-rows-[repeat(5,max-content)] w-full rounded-box p-7">
    <button className=" btn">基本色</button>
    <button className=" btn btn-base-100 btn-outline">基本色</button>
    <button className=" btn btn-primary">メインカラー</button>
    <button className=" btn btn-primary btn-outline">メインカラー</button>
    <button className=" btn btn-secondary">サブカラー</button>
    <button className=" btn btn-secondary btn-outline">サブカラー</button>
    <button className=" btn btn-neutral">ナチュラル</button>
    <button className=" btn btn-neutral btn-outline">ナチュラル</button>
    <button className=" btn btn-accent">アクセント</button>
    <button className=" btn btn-accent btn-outline">アクセント</button>
    <button className=" btn btn-success">成功色</button>
    <button className=" btn btn-success btn-outline">成功色</button>
    <button className=" btn btn-info">情報色</button>
    <button className=" btn btn-info btn-outline">情報色</button>
    <button className=" btn btn-warning">警告色</button>
    <button className=" btn btn-warning btn-outline">警告色</button>
    <button className=" btn btn-error">エラー色</button>
    <button className=" btn btn-error btn-outline">エラー色</button>
    <button className=" btn btn-ghost">ゴースト</button>
  </div>
);
const Badge = (
  <div className="inline-grid gap-2 grid-cols-4 grid-rows-[repeat(5,max-content)] w-full rounded-box p-7 items-center">
    <div className=" badge">基本色</div>
    <div className=" badge badge-outline">基本色</div>
    <div className=" badge badge-primary">メインカラー</div>
    <div className=" badge badge-primary badge-outline">メインカラー</div>
    <div className=" badge badge-secondary">サブカラー</div>
    <div className=" badge badge-secondary badge-outline">サブカラー</div>
    <div className=" badge badge-neutral">ナチュラル</div>
    <div className=" badge badge-neutral badge-outline">ナチュラル</div>
    <div className=" badge badge-accent">アクセント</div>
    <div className=" badge badge-accent badge-outline">アクセント</div>
    <div className=" badge badge-success">成功色</div>
    <div className=" badge badge-success badge-outline">成功色</div>
    <div className=" badge badge-info">情報色</div>
    <div className=" badge badge-info badge-outline">情報色</div>
    <div className=" badge badge-warning">警告色</div>
    <div className=" badge badge-warning badge-outline">警告色</div>
    <div className=" badge badge-error">エラー色</div>
    <div className=" badge badge-error badge-outline">エラー色</div>
    <div className=" badge badge-ghost">ゴースト</div>
  </div>
);

const Link = (
  <div className="w-full p-9">
    <div className="tabs tabs-lifted">
      <button className="tab">Tab</button> <button className="tab tab-active">Tab</button>
      <button className="tab">Tab</button>
    </div>
    <div className="flex flex-col">
      <span className="link">I'm a simple link</span>
      <span className="link link-primary">I'm a simple link</span>
      <span className="link link-secondary">I'm a simple link</span>
      <span className="link link-accent">I'm a simple link</span>
    </div>
  </div>
);
const Progress = (
  <div className="flex flex-col gap-3 w-full p-9">
    <progress className="progress" max="100" value="20">
      Default
    </progress>
    <progress className="progress progress-primary" max="100" value="25">
      Primary
    </progress>
    <progress className="progress progress-secondary" max="100" value="30">
      Secondary
    </progress>
    <progress className="progress progress-accent" max="100" value="40">
      Accent
    </progress>
    <progress className="progress progress-info" max="100" value="45">
      Info
    </progress>
    <progress className="progress progress-success" max="100" value="55">
      Success
    </progress>
    <progress className="progress progress-warning" max="100" value="70">
      Warning
    </progress>
    <progress className="progress progress-error" max="100" value="90">
      Error
    </progress>
  </div>
);
const Info = (
  <div className="flex flex-col gap-3 p-9">
    <div className="alert">
      <svg
        className="stroke-info h-6 w-6 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      <span>12 unread messages. Tap to see.</span>
    </div>
    <div className="alert alert-info">
      <svg
        className="h-6 w-6 shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      <span>New software update available.</span>
    </div>
    <div className="alert alert-success">
      <svg
        className="h-6 w-6 shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      <span>Your purchase has been confirmed!</span>
    </div>
    <div className="alert alert-warning">
      <svg
        className="h-6 w-6 shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"></path>
      </svg>
      <span>Warning: Invalid email address!</span>
    </div>
    <div className="alert alert-error">
      <svg
        className="h-6 w-6 shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      <span>Error! Task failed successfully.</span>
    </div>
  </div>
);
const Full = () => {
  return (
    <div className="p-9 z-0">
      <div className="rounded-box text-base-content not-prose grid gap-3 border p-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="stats bg-base-300 border-base-300 border md:w-1/2">
              <div className="stat">
                <div className="stat-title">Total Page Views</div>
                <div className="stat-value">89,400</div>
                <div className="stat-desc">21% more than last month</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 md:w-1/2">
              <div
                className="radial-progress"
                style={
                  {
                    "--size": "3.5rem",
                    "--value": "60",
                  } as any
                }>
                60%
              </div>
              <div
                className="radial-progress"
                style={
                  {
                    "--size": "3.5rem",
                    "--value": "75",
                  } as any
                }>
                75%
              </div>
              <div
                className="radial-progress"
                style={
                  {
                    "--size": "3.5rem",
                    "--value": "90",
                  } as any
                }>
                90%
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="md:w-1/2">
              <div>
                <input className="toggle" defaultChecked type="checkbox" />
                <input className="toggle toggle-primary" defaultChecked type="checkbox" />
                <input className="toggle toggle-secondary" defaultChecked type="checkbox" />
                <input className="toggle toggle-accent" defaultChecked type="checkbox" />
              </div>
              <div>
                <input className="checkbox" defaultChecked type="checkbox" />
                <input className="checkbox checkbox-primary" defaultChecked type="checkbox" />
                <input className="checkbox checkbox-secondary" defaultChecked type="checkbox" />
                <input className="checkbox checkbox-accent" defaultChecked type="checkbox" />
              </div>
              <div>
                <input className="radio" defaultChecked name="radio-1" type="radio" />
                <input className="radio radio-primary" name="radio-1" type="radio" />
                <input className="radio radio-secondary" name="radio-1" type="radio" />
                <input className="radio radio-accent" name="radio-1" type="radio" />
              </div>
            </div>
            <div className="md:w-1/2">
              <input className="range range-xs" defaultValue="90" max="100" min="0" type="range" />
              <input
                className="range range-xs range-primary"
                defaultValue="70"
                max="100"
                min="0"
                type="range"
              />
              <input
                className="range range-xs range-secondary"
                defaultValue="50"
                max="100"
                min="0"
                type="range"
              />
              <input
                className="range range-xs range-accent"
                defaultValue="40"
                max="100"
                min="0"
                type="range"
              />
            </div>
          </div>

          <div className="navbar bg-neutral text-neutral-content rounded-box">
            <div className="flex-none">
              <button className="btn btn-square btn-ghost">
                <svg
                  className="inline-block h-5 w-5 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1">
              <button className="btn btn-ghost text-xl">daisyUI</button>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-grow flex-col gap-3">
              <div className="text-4xl font-bold">Text Size 1</div>
              <div className="text-3xl font-bold">Text Size 2</div>
              <div className="text-2xl font-bold">Text Size 3</div>
              <div className="text-xl font-bold">Text Size 4</div>
              <div className="text-lg font-bold">Text Size 5</div>
              <div className="text-sm font-bold">Text Size 6</div>
              <div className="text-xs font-bold">Text Size 7</div>
            </div>
            <ul className="steps steps-vertical">
              <li className="step step-primary">Step 1</li>
              <li className="step step-primary">Step 2</li>
              <li className="step">Step 3</li>
              <li className="step">Step 4</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Preview = {
  Badge,
  Button,
  Link,
  Progress,
  Full,
  Info,
};
