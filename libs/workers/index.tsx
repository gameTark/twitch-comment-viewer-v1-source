import { is } from "@libs/is";
import { logger } from "@libs/logger";

export const createSharedWorker = () =>
  new SharedWorker(new URL("./SharedWorker", import.meta.url));

const createWorker = async () => {
  if (is.runner.server) return;
  const log = logger("debug");
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    log("サービスワーカー登録成功:", registration);
  } catch (error) {
    console.error(`Registration failed with ${error}`);
  }
};

export const registrationServiceWorker = () => createWorker();
