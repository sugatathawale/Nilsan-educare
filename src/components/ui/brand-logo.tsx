import Image from "next/image";
import Link from "next/link";
import { cx } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  compact?: boolean;
  className?: string;
};

export function BrandLogo({
  href = "/dashboard",
  compact = false,
  className
}: BrandLogoProps) {
  return (
    <Link className={cx("brand-logo", compact && "brand-logo--compact", className)} href={href}>
      <Image
        alt="Nilsan Educare"
        className="brand-logo__image"
        height={compact ? 48 : 56}
        priority
        src="/images/nilsanlogo.png"
        width={compact ? 180 : 220}
      />
    </Link>
  );
}
