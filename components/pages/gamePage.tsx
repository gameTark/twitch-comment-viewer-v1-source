"use client";

import React from "react";

import { BroadcastInformation } from "@components/twitch/Broadcast";
import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";

export default function GamePage() {
  const scroll = usePerfectScrollbar([]);

  return (
    <div className="flex h-full grow perfect-scrollbar" ref={scroll.ref}>
      <BroadcastInformation />
    </div>
  );
}
