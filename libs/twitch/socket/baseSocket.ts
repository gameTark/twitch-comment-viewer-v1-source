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
  public socket: WebSocket | null = null;
  public ready?: Promise<any>;

  private userId: string;
  private socketId: string | null = null;

  /**
   * soketが予期せぬ方法で死んだ場合に復活させたいからそのためのフラグs
   */
  private destroied: boolean = false;
  private reisteredSubsctiptions: Array<keyof TwitchSocketEventmap> = [];

  constructor(props: { userId: string }) {
    super();
    this.userId = props.userId;

    this.start = this.start.bind(this);
    this.closedEventHandler = this.closedEventHandler.bind(this);
    this.messageEventHandler = this.messageEventHandler.bind(this);
    this.scoketStart = this.scoketStart.bind(this);

    this.scoketStart();
  }

  private messageEventHandler(ev: MessageEvent) {
    const data = JSON.parse(ev.data);
    const event = calcrateEventType(data);
    this.dispatchTypedEvent(
      event,
      new CustomEvent(event, {
        detail: data,
      }),
    );
  }

  private closedEventHandler() {
    if (this.destroied) return;
    this.scoketStart();
  }

  scoketStart() {
    this.socket = new WebSocket(createWsEndpoint(10));
    this.socket.addEventListener("message", this.messageEventHandler);
    this.socket.addEventListener("close", this.closedEventHandler);
    this.updateSubscriptions();
    this.ready = this.start();
  }

  async eventSubscription(...keys: Array<keyof TwitchSocketEventmap>) {
    this.reisteredSubsctiptions = [...this.reisteredSubsctiptions, ...keys];
    await this.updateSubscriptions();
  }

  private async updateSubscriptions() {
    const events = this.reisteredSubsctiptions.map((key) => {
      if (this.socketId == null) throw new Error("socket id is not found");
      return registerEventType(key, this.socketId, this.userId);
    });
    await Promise.all(events);
  }

  close() {
    if (this.socket == null) return;
    this.destroied = true;
    this.socket.close();
    this.socket = null;
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
