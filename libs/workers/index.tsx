export const createSharedWorker = () =>
  new SharedWorker(new URL("./SharedWorker", import.meta.url));
