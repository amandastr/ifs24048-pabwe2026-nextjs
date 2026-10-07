import { describe, it, expect } from "vitest";
import { store } from "./store";

describe("store", () => {
  it("memiliki reducer auth dan posts", () => {
    const state = store.getState();

    expect(state).toHaveProperty("auth");
    expect(state).toHaveProperty("posts");
  });

  it("menyediakan dispatch", () => {
    expect(typeof store.dispatch).toBe("function");
  });
});