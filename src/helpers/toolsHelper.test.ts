import { describe, it, expect, vi, beforeEach } from "vitest";
import Swal from "sweetalert2";
import {
  showSuccessDialog,
  showErrorDialog,
  showWarningDialog,
  showConfirmDialog,
  formatDate,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn() },
}));

const fireMock = vi.mocked(Swal.fire);

describe("dialog helpers", () => {
  beforeEach(() => {
    fireMock.mockReset();
    fireMock.mockResolvedValue({ isConfirmed: true } as never);
  });

  it("showSuccessDialog memakai judul bawaan dan judul kustom", async () => {
    await showSuccessDialog("ok");
    expect(fireMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ icon: "success", title: "Berhasil", text: "ok" })
    );

    await showSuccessDialog("ok", "Judul Lain");
    expect(fireMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: "Judul Lain" })
    );
  });

  it("showErrorDialog memakai judul bawaan dan judul kustom", async () => {
    await showErrorDialog("salah");
    expect(fireMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ icon: "error", title: "Gagal", text: "salah" })
    );

    await showErrorDialog("salah", "Error");
    expect(fireMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: "Error" })
    );
  });

  it("showWarningDialog memakai judul bawaan dan judul kustom", async () => {
    await showWarningDialog("awas");
    expect(fireMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        icon: "warning",
        title: "Peringatan",
        text: "awas",
      })
    );

    await showWarningDialog("awas", "Hati-hati");
    expect(fireMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: "Hati-hati" })
    );
  });

  it("showConfirmDialog mengembalikan true jika dikonfirmasi", async () => {
    fireMock.mockResolvedValue({ isConfirmed: true } as never);

    await expect(showConfirmDialog("hapus?")).resolves.toBe(true);
    expect(fireMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        icon: "question",
        title: "Konfirmasi",
        text: "hapus?",
        showCancelButton: true,
      })
    );
  });

  it("showConfirmDialog mengembalikan false jika dibatalkan dan memakai judul kustom", async () => {
    fireMock.mockResolvedValue({ isConfirmed: false } as never);

    await expect(showConfirmDialog("hapus?", "Yakin?")).resolves.toBe(false);
    expect(fireMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: "Yakin?" })
    );
  });
});

describe("formatDate", () => {
  it("mengembalikan tanda hubung jika kosong", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    expect(formatDate("")).toBe("-");
  });

  it("memformat tanggal valid ke bahasa Indonesia", () => {
    const result = formatDate("2024-10-05T10:00:00Z");

    expect(result).toContain("2024");
    expect(result).toContain("Oktober");
  });

  it("mengembalikan teks asli jika tanggal tidak valid", () => {
    expect(formatDate("bukan tanggal")).toBe("bukan tanggal");
  });
});