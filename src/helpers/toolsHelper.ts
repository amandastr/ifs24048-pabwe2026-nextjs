import Swal from "sweetalert2";

export function showSuccessDialog(message: string, title = "Berhasil") {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonColor: "#0f766e",
  });
}

export function showErrorDialog(message: string, title = "Gagal") {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonColor: "#dc2626",
  });
}

export function showWarningDialog(message: string, title = "Peringatan") {
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
    confirmButtonColor: "#d97706",
  });
}

export function showConfirmDialog(
  message: string,
  title = "Konfirmasi"
): Promise<boolean> {
  return Swal.fire({
    icon: "question",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: "#0f766e",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
  }).then((result) => result.isConfirmed);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
}