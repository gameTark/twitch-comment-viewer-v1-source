import { useEventSubContext } from "@contexts/twitch/eventSubContext";
import { useAsyncMemo } from "@libs/uses";

import { fetchChannelInfo } from "../../libs/twitch";

// https://dev.twitch.tv/docs/api/reference/#get-channel-information
// https://dev.twitch.tv/docs/api/reference/#modify-channel-information

export const channel = () => {
  const ctx = useEventSubContext();
  const channelInfo = useAsyncMemo(async () => {
    if (ctx == null) return;
    const info = await fetchChannelInfo({
      broadcaster_id: ctx.me.id,
    });
    return info.data[0];
  }, [ctx]);
  if (channelInfo == null) return <></>;

  return (
    <div>
      <div>
        <h1>game name: {channelInfo.game_id}</h1>
        <h1>game name: {channelInfo.game_name}</h1>
        <p>title: {channelInfo.title}</p>
        <p>delay: {channelInfo.delay}</p>
        <p>classefication labels</p>
        {/* 画像取得したい */}
      </div>
    </div>
  );
};
