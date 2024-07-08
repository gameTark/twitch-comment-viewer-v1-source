import { useEffect, useState } from "react";

import { dayjs } from "../../libs/dayjs";
import { useInterval } from "../../uses/useInterval";
import { Stat } from "../dasyui/Stat";

export const MiniClock = () => {
  const [state, setState] = useState({
    date: "0000/00/00",
    time: "00:00",
    daysOfWeek: "月",
  });
  useInterval(
    () => {
      const day = dayjs(new Date());
      setState({
        date: day.format("YYYY/MM/DD"),
        time: day.format("HH:mm"),
        daysOfWeek: day.format("ddd"),
      });
    },
    {
      interval: 1000,
      deps: [],
    },
  );

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex justify-between w-full">
        <div className="countdown text-xs">{state.time}</div>
        <div className="countdown text-xs">({state.daysOfWeek})</div>
      </div>
      <div className="countdown text-xs">{state.date}</div>
    </div>
  );
};
export const CalenrdarClock = () => {
  const [state, setState] = useState({
    date: "0000/00/00",
    time: "00:00",
    daysOfWeek: "月",
  });
  useInterval(
    () => {
      const day = dayjs(new Date());
      setState({
        date: day.format("YYYY/MM/DD"),
        time: day.format("HH:mm"),
        daysOfWeek: day.format("ddd"),
      });
    },
    {
      interval: 1000,
      deps: [],
    },
  );

  return (
    <Stat
      title="日付"
      value={
        <div className="flex flex-col items-end gap-1">
          <div className="countdown text-2xl">{state.date}</div>
          <div className="countdown text-2xl">{state.time}</div>
        </div>
      }
      icon={<div className=" text-2xl">({state.daysOfWeek})</div>}
    />
  );
};

export const Clock = (props: {
  startMilliSeconds?: number;
  pause?: boolean;
  containsTimeZone?: boolean;
}) => {
  const [time, setTime] = useState<string>("00:00:00");
  const zeroPad2Digits = new Intl.NumberFormat("ja", { minimumIntegerDigits: 2 });

  useEffect(() => {
    if (props.pause != null) return;
    if (props.startMilliSeconds == null) return;
    const startMilliSeconds = props.startMilliSeconds;

    const id = window.setInterval(() => {
      const time = new Date(Date.now() - startMilliSeconds);
      const tz = props.containsTimeZone ? -time.getTimezoneOffset() / 60 : 0;
      setTime(
        `${zeroPad2Digits.format((time.getUTCHours() + tz + 24) % 24)}:${zeroPad2Digits.format(
          time.getUTCMinutes(),
        )}:${zeroPad2Digits.format(time.getUTCSeconds())}`,
      );
    }, 1000);
    return () => {
      window.clearInterval(id);
    };
  }, [props.startMilliSeconds, props.pause]);

  return (
    <span className=" text-xs">
      <span>{time}</span>
    </span>
  );
};
