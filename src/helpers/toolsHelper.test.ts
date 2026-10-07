import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  showSuccessDialog,
  showErrorDialog,
  showWarningDialog,
  showConfirmDialog,
  formatDate,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

import Swal from "sweetalert2";

describe("toolsHelper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (Swal.fire as ReturnType<typeof vi.fn>).mockResolvedValue({
      isConfirmed: true,
    });
  });

  // ========== DIALOG ==========
  it("showSuccessDialog memanggil Swal.fire dengan icon success", async () => {
    await showSuccessDialog("Data tersimpan");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "success",
        title: "Berhasil",
        text: "Data tersimpan",
        confirmButtonColor: "#0f766e",
      })
    );
  });

  it("showSuccessDialog bisa custom title", async () => {
    await showSuccessDialog("OK", "Sukses Custom");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "success",
        title: "Sukses Custom",
        text: "OK",
      })
    );
  });

  it("showErrorDialog memanggil Swal.fire dengan icon error", async () => {
    await showErrorDialog("Terjadi kesalahan");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan",
        confirmButtonColor: "#dc2626",
      })
    );
  });

  it("showErrorDialog bisa custom title", async () => {
    await showErrorDialog("Error detail", "Oops");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "error",
        title: "Oops",
        text: "Error detail",
      })
    );
  });

  it("showWarningDialog memanggil Swal.fire dengan icon warning", async () => {
    await showWarningDialog("Hati-hati");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "warning",
        title: "Peringatan",
        text: "Hati-hati",
        confirmButtonColor: "#d97706",
      })
    );
  });

  it("showWarningDialog bisa custom title", async () => {
    await showWarningDialog("Cek lagi", "Warning Custom");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "warning",
        title: "Warning Custom",
        text: "Cek lagi",
      })
    );
  });

  it("showConfirmDialog return true jika dikonfirmasi", async () => {
    (Swal.fire as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      isConfirmed: true,
    });
    const result = await showConfirmDialog("Yakin hapus?");
    expect(result).toBe(true);
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "question",
        title: "Konfirmasi",
        text: "Yakin hapus?",
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Batal",
      })
    );
  });

  it("showConfirmDialog return false jika dibatalkan", async () => {
    (Swal.fire as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      isConfirmed: false,
    });
    const result = await showConfirmDialog("Yakin?");
    expect(result).toBe(false);
  });

  it("showConfirmDialog bisa custom title", async () => {
    (Swal.fire as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      isConfirmed: true,
    });
    await showConfirmDialog("Lanjut?", "Konfirmasi Custom");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Konfirmasi Custom",
        text: "Lanjut?",
      })
    );
  });

  // ========== formatDate ==========
  it("formatDate memformat tanggal valid", () => {
    const result = formatDate("2026-01-15T10:30:00.000Z");
    expect(typeof result).toBe("string");
    expect(result).not.toBe("-");
    expect(result.length).toBeGreaterThan(0);
  });

  it("formatDate return '-' jika input kosong", () => {
    expect(formatDate("")).toBe("-");
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
  });

  it("formatDate masuk catch saat format gagal (baris 57-59)", () => {
    const spy = vi.spyOn(Intl, "DateTimeFormat").mockImplementation(() => {
      throw new Error("format error");
    });

    const input = "2026-01-01T00:00:00.000Z";
    const result = formatDate(input);
    // catch mengembalikan dateString asli
    expect(result).toBe(input);

    spy.mockRestore();
  });
});