"use client";

import { useEffect } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

export function useBloqueoContextMenu() {
  useEffect(() => {
    const bloquear = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener("contextmenu", bloquear);
    return () => document.removeEventListener("contextmenu", bloquear);
  }, []);

  return {
    onContextMenu: (event: ReactMouseEvent) => event.preventDefault(),
  };
}
