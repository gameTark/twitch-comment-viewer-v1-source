export type valueOf<T> = T[keyof T];
export type createListener<T> = (type: T, callback: (value: T[keyof T]) => void) => void;
export type EventListenerMap<Map, Callback> = <K extends keyof Map>(
  type: K,
  callback: (data: Map[K], __rowdata: MessageEvent<string>) => void,
) => Callback;

export interface Image {
  src: string;
  alt: string;
  srcSet?: string;
}
export const filter = {
  notNull: <T>(value: T): value is NonNullable<T> => value != null,
  notDeleted: <T extends { deletedAt?: Date }>(value: T) => value.deletedAt == null,
};
