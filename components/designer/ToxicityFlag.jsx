import { TOXICITY_LABELS } from "@/lib/plant-safety";

/** Icon + label toxicity/irritant/thorn flag (P1-6). Renders nothing if unset. */
export default function ToxicityFlag({ toxicity, compact = false }) {
  const info = TOXICITY_LABELS[toxicity];
  if (!info) return null;
  return (
    <span className={"toxicity-flag" + (compact ? " compact" : "")}>
      <span aria-hidden="true">{info.icon}</span> {info.label}
    </span>
  );
}
