/// <reference lib="WebWorker" />
export type {};
declare let self: ServiceWorkerGlobalScope;

// set intervalは起動しない https://future-architect.github.io/articles/20210216/

// period sync https://blog.jxck.io/entries/2020-04-23/periodic-background-sync.html

// follower / chatter あたりは取得できそう。
//   上記は配信以外で取得してもしかたなくないか？

// コメビュも配信開始でPush通知でやりたいけど可能？（不可能そう）
// コメントをRest化して多数取得できるようにしなければならない。どうしたものか。

// client keyあたりの扱いも怠そう。 local storageのままだと駄目

// 結果的にまだ非対応で良い。　ただしかし生でAPI叩くより、データを扱う層としては有用そう。
//   雑にAPI叩いて良い感じは楽そう。

self.addEventListener("install", async (ev) => {
  console.log("Service worker installed (cjs)");
});

self.addEventListener("fetch", (evt) => {});

self.addEventListener("error", (err) => {
  console.error("Service worker error", err);
});
