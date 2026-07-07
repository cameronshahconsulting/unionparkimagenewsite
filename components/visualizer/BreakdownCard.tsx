import type { DesignBreakdown, PlantLine } from "@/lib/ai";

function PlantRows({ label, lines }: { label: string; lines: PlantLine[] }) {
  if (lines.length === 0) return null;
  return (
    <>
      {lines.map((l, i) => (
        <tr key={`${label}-${i}`}>
          {i === 0 && (
            <th
              rowSpan={lines.length}
              scope="rowgroup"
              className="border border-sand-200 bg-pine-50 px-3 py-2 text-left align-top text-xs font-semibold uppercase tracking-wide text-pine-900"
            >
              {label}
            </th>
          )}
          <td className="border border-sand-200 px-3 py-2">{l.commonName}</td>
          <td className="border border-sand-200 px-3 py-2 text-center">{l.quantity}</td>
          <td className="border border-sand-200 px-3 py-2 text-ink-soft">{l.size ?? "—"}</td>
        </tr>
      ))}
    </>
  );
}

export function BreakdownCard({ breakdown }: { breakdown: DesignBreakdown }) {
  const hasPlants =
    breakdown.trees.length + breakdown.shrubs.length + breakdown.flowersAndPerennials.length > 0;

  return (
    <div className="rounded-xl border border-sand-200 bg-white p-5 text-sm">
      <p className="leading-relaxed text-ink">{breakdown.summary}</p>

      {hasPlants && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-sand-200 bg-pine-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-pine-900">
                  Type
                </th>
                <th className="border border-sand-200 bg-pine-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-pine-900">
                  Plant
                </th>
                <th className="border border-sand-200 bg-pine-50 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-pine-900">
                  Qty
                </th>
                <th className="border border-sand-200 bg-pine-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-pine-900">
                  Size
                </th>
              </tr>
            </thead>
            <tbody>
              <PlantRows label="Trees" lines={breakdown.trees} />
              <PlantRows label="Shrubs" lines={breakdown.shrubs} />
              <PlantRows label="Flowers" lines={breakdown.flowersAndPerennials} />
            </tbody>
          </table>
        </div>
      )}

      {breakdown.materials.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {breakdown.materials.map((m, i) => (
            <li key={i} className="flex justify-between gap-4">
              <span>{m.item}</span>
              <span className="font-medium text-pine-900">{m.estQuantity}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs leading-relaxed text-ink-soft">
        AI concept preview — plant counts and quantities are estimates. Your final
        design and written quote come from a real person who visits your property.
      </p>
    </div>
  );
}
