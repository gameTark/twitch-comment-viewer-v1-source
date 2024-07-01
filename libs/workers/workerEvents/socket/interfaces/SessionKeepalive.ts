import { createIsSocketType } from "./base";

export interface SessionKeepalive {
  metadata: {
    message_id: string;
    message_type: "session_keepalive";
    message_timestamp: string;
  };
  payload: {};
}
export const isSessionKeepalive = createIsSocketType<SessionKeepalive>("session_keepalive");
