import * as React from "react";

import "perfect-scrollbar/css/perfect-scrollbar.css";
import "../styles/globals.css";

import { TwitchRouter } from "@contexts/twitch/eventSubContext";

import { ApplyTheme, FontLoader } from "@components/commons/Theme";
import { Drawer } from "@components/dasyui/Drawer";
import { ModalProvider } from "@components/dasyui/Modal";
import { TanstackQueryProvider } from "@components/middlewares/TanstackQueryProvider";
import { Footer } from "@components/pages/footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" data-theme="nord">
      <head>
        <title>Twitch Commen viewer</title>
        <link rel="icon" href="./icon.svg" />
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
