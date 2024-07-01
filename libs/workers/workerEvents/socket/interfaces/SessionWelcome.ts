import { BaseTwitchSocketResult, createIsSocketType } from "./base";

export type SessionWelcome = {
  metadata: {
    message_id: string;
    message_type: "session_welcome";
    message_timestamp: string;
  };
  payload: {
    session: {
      id: string;
      status: string;
      connected_at: string;
      keepalive_timeout_seconds: number;
      reconnect_url: any; // TODO: anyの中身を要確認
    };
  };
};
export const isSessionWelcome = createIsSocketType<SessionWelcome>("session_welcome");
