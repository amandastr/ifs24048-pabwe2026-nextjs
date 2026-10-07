import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInput } from "./useInput";
import type { ChangeEvent } from "react";

describe("useInput", () => {
  it("mengembalikan nilai awal", () => {
    const { result } = renderHook(() => useInput("hello"));
    expect(result.current.value).toBe("hello");
  });

  it("mengubah nilai saat onChange dipanggil", () => {
    const { result } = renderHook(() => useInput(""));
    act(() => {
      result.current.onChange({
        target: { value: "test" },
      } as ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.value).toBe("test");
  });

  it("reset nilai ke default", () => {
    const { result } = renderHook(() => useInput("awal"));
    act(() => {
      result.current.onChange({
        target: { value: "baru" },
      } as ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.value).toBe("baru");

    act(() => {
      result.current.reset();
    });
    expect(result.current.value).toBe("awal");
  });
});