const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function timeAgo(date: string | Date, now: Date = new Date()): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const diff = now.getTime() - then.getTime();

  if (diff < MINUTE) return "Just now";
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  if (diff < 2 * DAY) return "Yesterday";

  return then.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatDate(date: string | Date): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
