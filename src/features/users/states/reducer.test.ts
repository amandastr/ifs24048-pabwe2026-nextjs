import { describe, it, expect } from "vitest";
import usersReducer, { clearUsersError, setProfile } from "./reducer";
import type { User } from "@/types";

const mockUser: User = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  photo: null,
};

describe("usersReducer", () => {
  const initialState = {
    users: [] as User[],
    user: null as User | null,
    profile: null as User | null,
    isProfile: false,
    isChangeProfile: false,
    isChangeProfilePhoto: false,
    isChangeProfilePassword: false,
    isLoading: false,
    error: null as string | null,
  };

  it("mengembalikan initial state saat action unknown", () => {
    expect(usersReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("clearUsersError menghapus error", () => {
    const prev = { ...initialState, error: "Terjadi kesalahan" };
    const next = usersReducer(prev, clearUsersError());
    expect(next.error).toBeNull();
  });

  it("setProfile mengisi data profile", () => {
    const next = usersReducer(initialState, setProfile(mockUser));
    expect(next.profile).toEqual(mockUser);
  });

  it("setProfile bisa di-set ke null", () => {
    const prev = { ...initialState, profile: mockUser };
    const next = usersReducer(prev, setProfile(null));
    expect(next.profile).toBeNull();
  });
});