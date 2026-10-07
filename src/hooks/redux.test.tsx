import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import type { ReactNode } from "react";
import { store } from "@/store";
import { useAppDispatch, useAppSelector } from "./redux";

describe("hooks redux", () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  it("useAppDispatch mengembalikan dispatch milik store", () => {
    const { result } = renderHook(() => useAppDispatch(), { wrapper });

    expect(result.current).toBe(store.dispatch);
  });

  it("useAppSelector membaca state dari store", () => {
    const { result } = renderHook(() => useAppSelector((s) => s.auth), {
      wrapper,
    });

    expect(result.current).toBe(store.getState().auth);
  });
});