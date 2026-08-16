import Image from "next/image";
import { site } from "@/lib/site";

/** Compact UPL mark (pink fill + cyan outline) for small UI spots. */
export function UplMark({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <Image
      src="/images/upl-mark.png"
      alt=""
      width={88}
      height={88}
      className={`rounded-lg object-cover ${className}`}
      aria-hidden
    />
  );
}

export function Logo({
  light = false,
  compact = false,
}: {
  light?: boolean;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-2">
        <UplMark className="h-11 w-11 sm:h-12 sm:w-12" />
        <span className="sr-only">{site.name}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center">
      <Image
        src="/images/upl-logo.png"
        alt={site.name}
        width={960}
        height={148}
        className={`h-10 w-auto sm:h-12 lg:h-14 ${light ? "brightness-110" : ""}`}
        priority
      />
    </span>
  );
}
