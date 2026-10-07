import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ChangeEvent } from "react";
import { useInput } from "./useInput";

const fakeEvent = (value: string) =>
  ({ target: { value } }) as unknown as ChangeEvent<HTMLInputElement>;

describe("useInput", () => {
  it("nilai awal kosong jika tidak diberi argumen", () => {
    const { result } = renderHook(() => useInput());

    expect(result.current.value).toBe("");
  });

  it("onChange mengubah nilai", () => {
    const { result } = renderHook(() => useInput());

    act(() => result.current.onChange(fakeEvent("halo")));

    expect(result.current.value).toBe("halo");
  });

  it("setValue mengubah nilai langsung", () => {
    const { result } = renderHook(() => useInput());

    act(() => result.current.setValue("langsung"));

    expect(result.current.value).toBe("langsung");
  });

  it("reset mengembalikan ke nilai awal", () => {
    const { result } = renderHook(() => useInput("awal"));
    expect(result.current.value).toBe("awal");

    act(() => result.current.onChange(fakeEvent("berubah")));
    expect(result.current.value).toBe("berubah");

    act(() => result.current.reset());
    expect(result.current.value).toBe("awal");
  });
});