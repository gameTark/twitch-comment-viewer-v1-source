import * as React from "react";

import "perfect-scrollbar/css/perfect-scrollbar.css";
import "../styles/globals.css";

import { TwitchRouter } from "@contexts/twitch/eventSubContext";

import { ApplyTheme, applyTheme, FontLoader } from "@components/commons/Theme";
import { Drawer } from "@components/dasyui/Drawer";
import { ModalProvider } from "@components/dasyui/Modal";
import { TanstackQueryProvider } from "@components/middlewares/TanstackQueryProvider";
import { Footer } from "@components/pages/footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" data-theme="nord">
      <head>
        <title>hello</title>
        {/* TODO: 直接JSを書き込んでいるが、Reactの準備より前に呼ぶ方法がわからないため暫定処理 */}
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `
            document.getElementsByTagName("html")[0].dataset.theme = localStorage.getItem("theme-application-001") || "lemonade";
          `,
          }}></script> */}
      </head>
      <body>
        <ApplyTheme />
        <TwitchRouter>
          <TanstackQueryProvider>
            <div className="max-h-screen h-screen w-full max-w-screen oveflow-hidden flex flex-col border-base-content/20">
              <ModalProvider>
                <FontLoader targetFamily={["Noto+Sans+JP:wght@100..900"]} />
                <Drawer>
                  <div className="h-96 grow">{children}</div>
                  <div className="h-fit">
                    <Footer />
                  </div>
                </Drawer>
              </ModalProvider>
            </div>
          </TanstackQueryProvider>
        </TwitchRouter>
      </body>
    </html>
  );
}
