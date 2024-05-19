"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { isProd } from "@resource/constants";

// info https://zenn.dev/taisei_13046/books/133e9995b6aadf/viewer/c22ed5
const queryClient = new QueryClient();
export function TanstackQueryProvider(props: { children?: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
      {isProd ? null : <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
