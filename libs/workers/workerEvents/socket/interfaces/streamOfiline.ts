import { BaseSubscription, createIsSocketType } from "./base";

export type StreamOffline = {
  metadata: {
    message_id: string;
    message_type: "notification";
    message_timestamp: string;
    subscription_type: "stream.offline";
    subscription_version: string;
  };
  payload: {
    subscription: BaseSubscription;
    event: {
      broadcaster_user_id: string;
      broadcaster_user_login: string;
      broadcaster_user_name: string;
    };
  };
};
export const isStreamOffline = createIsSocketType("notification", "stream.offline");
