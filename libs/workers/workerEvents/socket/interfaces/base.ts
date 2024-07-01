interface SubscriptionMetadata {
  message_id: string;
  message_type: "notification";
  message_timestamp: string;
  subscription_type: string;
  subscription_version: string;
}
interface BasicMetadata {
  message_id: string;
  message_type: string;
  message_timestamp: string;
}
type M = BasicMetadata | SubscriptionMetadata;

export interface BaseSubscription {
  id: string;
  status: string;
  type: string;
  version: string;
  condition: Condition;
  transport: Transport;
  created_at: string;
  cost: number;
}

interface Condition {
  broadcaster_user_id: string;
}

interface Transport {
  method: string;
  session_id: string;
}

export interface BaseTwitchSocketResult<Metadata extends M, Payload extends {}> {
  metadata: Metadata;
  payload: Payload;
}

export const createIsSocketType =
  <T extends BaseTwitchSocketResult<any, any>>(messageType: string, subscriptionType?: string) =>
  (ev: BaseTwitchSocketResult<any, any>): ev is T => {
    if (messageType === ev.metadata.message_type) {
      // validation SubscriptionTypeが無い場合はスルー
      if (subscriptionType == null) return true;
      if (ev.metadata.subscription_type === subscriptionType) return true;
    }

    return false;
  };
