import { TypedEventTarget } from "typescript-event-target";

import { calcrateEventType, registerEventType, TwitchSocketEventmap } from "./interfaces";

const ENDPOINT = "wss://eventsub.wss.twitch.tv/ws";
const createWsEndpoint = (keepaliveTimeoutSeconds: number) => {
  if (keepaliveTimeoutSeconds <= 0)
    console.warn("keepalive timeout secondsは0以上の値である必要があります。");
  if (keepaliveTimeoutSeconds >= 600)
    console.warn("keepalive timeout secondsは600以下の値である必要があります。");
  return `${ENDPOINT}?keepalive_timeout_seconds=${keepaliveTimeoutSeconds}`;
};

export class TwitchWebSocket extends TypedEventTarget<TwitchSocketEventmap> {
  public socket: WebSocket;
  public ready: Promise<any>;

  private userId: string;
  private socketId: string | null = null;

  constructor(props: { userId: string }) {
    super();
    this.socket = new WebSocket(createWsEndpoint(30));
    this.connect = this.connect.bind(this);
    this.start = this.start.bind(this);

    this.ready = this.start();
    this.userId = props.userId;

    this.socket.addEventListener("message", (ev) => {
      const data = JSON.parse(ev.data);
      const event = calcrateEventType(data);
      this.dispatchTypedEvent(
        event,
        new CustomEvent(event, {
          detail: data,
        }),
      );
    });
  }

  async eventSubscription(...keys: Array<keyof TwitchSocketEventmap>) {
    const events = keys.map((key) => {
      if (this.socketId == null) throw new Error("socket id is not found");
      return registerEventType(key, this.socketId, this.userId);
    });
    await Promise.all(events);
  }

  async connect() {
    await this.ready;
    if (this.socketId == null) return;
  }

  close() {
    this.socket.close();
  }

  private async start() {
    this.socketId = await new Promise<string>((resolve) => {
      this.addEventListener(
        "session.welcome",
        (ev) => {
          resolve(ev.detail.payload.session.id);
        },
        { once: true },
      );
    });
  }
}
