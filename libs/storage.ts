import { is } from "./is";

export class Storage<Interface extends {}> {
  private key: string;
  private defaultValue: Interface | null;

  constructor(
    key: string,
    options?: {
      defaultValue?: Interface;
    },
  ) {
    this.key = key;
    this.defaultValue = options?.defaultValue || null;
  }

  setItem(item: Interface) {
    localStorage.setItem(this.key, JSON.stringify(item));
  }

  getItem(): Interface | null {
    if (is.runner.server) return this.defaultValue || null;
    const item = localStorage.getItem(this.key);
    if (item == null) return item || this.defaultValue;
    return JSON.parse(item);
  }
}
