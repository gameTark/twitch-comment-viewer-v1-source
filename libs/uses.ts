"use client";

import {
  ChangeEvent,
  ChangeEventHandler,
  DependencyList,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { debounce } from "throttle-debounce";

type UseAsyncMemoProps<T> = Parameters<typeof useMemo<Promise<T>>>;
type UseAsyncMemoResult<T> = T | null;

export const useAsyncMemo = <T>(
  ...[factory, deps]: UseAsyncMemoProps<T>
): UseAsyncMemoResult<T> => {
  const [state, setState] = useState<UseAsyncMemoResult<T>>(null);
  useEffect(() => {
    const p = factory();
    setState(null);
    p.then((result) => {
      setState(result);
    });
  }, deps);
  return state;
};

export const useInput = (
  defaultValue: string = "",
): [value: string, onChangeHandler: ChangeEventHandler<HTMLInputElement>] => {
  const [value, setState] = useState<string>(defaultValue);
  const onChange = useCallback((e: ChangeEvent<HTMLElement>) => {
    if (e.currentTarget instanceof HTMLInputElement) setState(e.currentTarget.value);
  }, []);
  return [value, onChange];
};

// function useCallback<T extends Function>(callback: T, deps: DependencyList): T;
export const useDebounce = <T extends (...args: any[]) => any>(
  delay: number,
  callback: T,
  deps: DependencyList,
): debounce<T> => {
  const result = useMemo(() => {
    return debounce<T>(delay, callback);
  }, deps);
  return result;
};

export const useLogin = () => {
  const router = useRouter();
  const path = usePathname();
  return useCallback(() => {
    if (path === "/login") return;
    router.push("/login");
  }, [router, path]);
};
