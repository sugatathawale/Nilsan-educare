import { cx } from "@/lib/utils";

export function AdminStatus({ status }: { status: string }) {
  return (
    <span className={cx("admin-status", `admin-status--${status.toLowerCase()}`)}>
      {status}
    </span>
  );
}
