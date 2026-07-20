export const formatUploadDate = (date) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};

export const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes < 0) return "Not available";
  if (bytes === 0) return "0 Bytes";

  const units = ["Bytes", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** unitIndex);
  const precision = unitIndex === 0 ? 0 : value >= 10 ? 0 : 1;

  return `${value.toFixed(precision)} ${units[unitIndex]}`;
};

export const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case "COMPLETED":
      return "bg-green-500/10 text-green-700";
    case "PROCESSING":
      return "bg-tertiary/10 text-tertiary";
    case "FAILED":
      return "bg-error/10 text-error";
    default:
      return "bg-primary/10 text-primary";
  }
};
