import * as React from "react";

import "perfect-scrollbar/css/perfect-scrollbar.css";
import "../styles/globals.css";

import { EventSubContext } from "@contexts/twitch/eventSubContext";
import { GameContextProvider } from "@contexts/twitch/gameContext";
import { UserContextProvider } from "@contexts/twitch/userContext";

import { CodeJavascript } from "@components/commons/SyntaxHightlight";
import { Drawer } from "@components/dasyui/Drawer";
import { ModalProvider } from "@components/dasyui/Modal";
import { Footer } from "@components/pages";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <title>hello</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0aa574" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&family=Noto+Serif+JP&display=swap"
          rel="stylesheet"></link>
      </head>
      <body>
        <EventSubContext>
          <UserContextProvider>
            <GameContextProvider>
              <div className="max-h-screen h-screen w-full max-w-screen oveflow-hidden flex flex-col border-base-content/20">
                <ModalProvider>
                  <Drawer>
                    <div className="h-96 grow">{children}</div>
                    <div className="h-fit">
                      <Footer />
                    </div>
                  </Drawer>
                </ModalProvider>
              </div>
            </GameContextProvider>
          </UserContextProvider>
        </EventSubContext>
      </body>
    </html>
  );
}