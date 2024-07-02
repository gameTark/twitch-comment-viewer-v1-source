import { BaseSubscription, BaseTwitchSocketResult, createIsSocketType } from "./base";

const messageType = "notification";
const subscriptionType = "stream.online";
export interface StreamOnline {
  metadata: {
    message_id: string;
    message_type: typeof messageType;
    message_timestamp: string;
    subscription_type: typeof subscriptionType;
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
}
export const isStreamOnline = createIsSocketType(messageType, subscriptionType);
