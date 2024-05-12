import { baseFetch } from "..";

// https://dev.twitch.tv/docs/api/reference/#start-commercial
interface Success {
  data: {
    length: number;
    message: string;
    retry_after: number;
  }[];
}
type Result =
  | {
      isSuccess: true;
      status: number;
      value: Success;
    }
  | {
      isSuccess: false;
      status: number;
      value: string;
    };
export const StartCommercial = async (props: {
  broadcaster_id: string;
  length: number;
}): Promise<Result> => {
  const len = Math.max(0, Math.min(180, props.length));
  const fetcher = await baseFetch("https://api.twitch.tv/helix/channels/commercial", {
    method: "POST",
    body: JSON.stringify({
      broadcasetr_id: props.broadcaster_id,
      length: len,
    }),
  });
  switch (fetcher.status) {
    case 200: {
      const result = (await fetcher.json()) as Success;
      return {
        isSuccess: true,
        status: fetcher.status,
        value: result,
      };
    }
    default: {
      const result = await fetcher.text();
      return {
        isSuccess: false,
        status: fetcher.status,
        value: result,
      };
    }
  }
};
