"use client";

import { useCallback, useEffect, useRef } from "react";
import useStateMachine from "@cassiozen/usestatemachine";
import { v4 as uuid } from "uuid";

import { loop } from "@libs/utils";

import { logger } from "../libs/logger";

export const useBaseResourceLazyLoad = <
  Result,
  IdKey extends keyof Result,
  Id extends Result[IdKey],
>({
  fetcher,
  idKey,
  timeout,
  interval,
}: {
  fetcher: (ids: Id[]) => Promise<Result[]>;
  idKey: IdKey;
  interval?: number;
  timeout?: number;
}) => {
  const log = logger("debug");
  const _interval = interval || 500;
  const _timeout = timeout || 800;
  const [machine, send] = useStateMachine({
    initial: "initialized",
    states: {
      initialized: {
        on: { REQUEST_CREATE: "createdRequest" },
      },
      createdRequest: {
        on: { FETCH: "fetching" },
        effect: () => {
          setTimeout(() => {
            send("FETCH");
          }, _interval);
        },
      },
      fetching: {
        on: {
          COMPLETE: "completed",
          FAILE: "failed",
        },
        effect: () => {
          fetchProcess()
            .then(() => {
              send("COMPLETE");
            })
            .catch(() => {
              send("FAILE");
            });
        },
      },
      completed: {
        on: {
          INITIALIZE: "initialized",
          REST_REQUEST: "createdRequest",
        },
        effect: () => {
          setTimeout(() => {
            initialize();
            if (refQueues.current.size === 0) {
              send("INITIALIZE");
              return;
            }
            send("REST_REQUEST");
          }, _interval);
        },
      },
      failed: {
        on: {
          INITIALIZE: "initialized",
        },
        effect: () => {
          console.error("fail to fetch");
        },
      },
    },
  });
  const refQueues = useRef<Set<Id>>(new Set());
  const refData = useRef<Map<Result[typeof idKey], Result>>(new Map());
  const queue = useRef<Set<string>>(new Set());

  useEffect(() => {
    log(machine.value, {
      queue: queue.current,
      queues: refQueues.current,
      data: refData.current,
    });
  }, [machine]);

  const initialize = useCallback(() => {
    refQueues.current = new Set();
    // refData.current = new Map(); // TODO: キャッシュ戦略を考える
    queue.current = new Set();
  }, []);

  const fetchProcess = useCallback(async () => {
    const result = await fetcher(Array.from(refQueues.current));
    result.forEach((val) => refData.current.set(val[idKey], val));
    return null;
  }, []);

  const fetchByIds = useCallback(async (ids: Id[]): Promise<Map<Result[typeof idKey], Result>> => {
    const getResults = () => {
      const completedIds = ids.filter((id) => refData.current.has(id)).length;
      if (completedIds !== ids.length) return;
      return refData.current;
    };
    const result = getResults();
    if (result != null) return result; // TODO: キャッシュ戦略を考える

    send("REQUEST_CREATE");
    const id = uuid();
    queue.current.add(id);
    ids.forEach((val) => refQueues.current.add(val));
    return new Promise((resolve, reject) => {
      const cancelLoop = loop(() => {
        const data = getResults();
        if (data == null) return;
        destroy();
        resolve(refData.current);
      }, _interval / 4);

      const rejectId = setTimeout(() => {
        destroy();
        fetcher(ids)
          .then((result) => {
            result.forEach((val) => refData.current.set(val[idKey], val));
            resolve(refData.current);
          })
          .catch((err) => {
            reject(err);
          });
      }, _timeout);

      function destroy() {
        queue.current.delete(id);
        cancelLoop();
        clearTimeout(rejectId);
      }
    });
  }, []);

  return {
    fetchByIds,
    state: machine.value,
  };
};
