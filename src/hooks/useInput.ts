"use client";

import { useState, ChangeEvent } from "react";

export function useInput(initialValue = "") {
  const [value, setValue] = useState(initialValue);

  function onChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setValue(e.target.value);
  }

  function reset() {
    setValue(initialValue);
  }

  return {
    value,
    onChange,
    setValue,
    reset,
  };
}