"use client";

import { useEffect, useState } from "react";

const KEY = "puzzle-club-name";

export function useDisplayName() {
  const [name, setNameState] = useState("");

  useEffect(() => {
    try {
      setNameState(localStorage.getItem(KEY) ?? "");
    } catch {
      // storage unavailable
    }
  }, []);

  function setName(value: string) {
    setNameState(value);
    try {
      localStorage.setItem(KEY, value);
    } catch {
      // storage unavailable
    }
  }

  return [name, setName] as const;
}