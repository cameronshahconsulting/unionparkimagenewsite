import Image from "next/image";
import { site } from "@/lib/site";

/** Compact UPL mark (pink fill + cyan outline) for small UI spots. */
export function UplMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <Image
      src="/images/upl-mark.png"
      alt=""
      width={72}
      height={72}
      className={`rounded-md object-cover ${className}`}
      aria-hidden
    />
  );
}

export function Logo({
  light = false,
  compact = false,
}: {
  light?: boolean;
  /** Show the square UPL mark instead of the full wordmark. */
  compact?: boolean;
}) {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-2">
        <UplMark className="h-9 w-9" />
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
        className={`h-8 w-auto sm:h-9 ${light ? "brightness-110" : ""}`}
        priority
      />
    </span>
  );
}
