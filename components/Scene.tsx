/**
 * Illustrated scene placeholders in the brand palette. Swap for real project
 * photos by passing `photo` (a /public path) — the illustration is the
 * fallback until then.
 */
import Image from "next/image";

export type SceneVariant =
  | "garden"
  | "patio"
  | "drainage"
  | "fence"
  | "cleanup"
  | "lawn"
  | "home";

const P = {
  sky1: "#dcebe0",
  sky2: "#f3efe4",
  hillBack: "#a7c0ae",
  hillFront: "#7fa38c",
  ground: "#5d8a6f",
  groundDark: "#3f6b53",
  pine: "#1e4d38",
  pineDark: "#16382b",
  trunk: "#6b4f36",
  paver: "#c9b394",
  paverDark: "#b09873",
  clay: "#c86f3c",
  water: "#9fc3cf",
  fence: "#d8ccb6",
  bloom1: "#e3a05c",
  bloom2: "#c86f3c",
  bloom3: "#f0d7a3",
};

function Tree({ x, y, s = 1, round = false }: { x: number; y: number; s?: number; round?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-2.5" y="-6" width="5" height="14" rx="2" fill={P.trunk} />
      {round ? (
        <circle cx="0" cy="-22" r="19" fill={P.pine} />
      ) : (
        <>
          <path d="M0-52 L16-24 H-16 Z" fill={P.pine} />
          <path d="M0-38 L20-6 H-20 Z" fill={P.pineDark} />
        </>
      )}
    </g>
  );
}

function Shrub({ x, y, s = 1, tone = P.pine }: { x: number; y: number; s?: number; tone?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="14" ry="10" fill={tone} />
      <ellipse cx="-9" cy="3" rx="9" ry="7" fill={P.groundDark} opacity="0.6" />
    </g>
  );
}

function Blooms({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[P.bloom1, P.bloom2, P.bloom3, P.bloom1, P.bloom2].map((c, i) => (
        <circle key={i} cx={i * 9 - 18} cy={(i % 2) * 4 - 2} r="3.2" fill={c} />
      ))}
    </g>
  );
}

function Base({ children }: { children: React.ReactNode }) {
  return (
    <>
      <defs>
        <linearGradient id="scene-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.sky1} />
          <stop offset="1" stopColor={P.sky2} />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill="url(#scene-sky)" />
      <circle cx="330" cy="46" r="22" fill={P.bloom3} />
      <path d="M0 150 Q100 118 200 142 T400 132 V260 H0 Z" fill={P.hillBack} />
      <path d="M0 178 Q120 150 240 172 T400 164 V260 H0 Z" fill={P.hillFront} />
      <path d="M0 205 Q140 185 280 202 T400 198 V260 H0 Z" fill={P.ground} />
      {children}
    </>
  );
}

const scenes: Record<SceneVariant, React.ReactNode> = {
  garden: (
    <Base>
      <Tree x={60} y={170} s={1.1} />
      <Tree x={340} y={162} s={0.9} round />
      <path d="M40 250 Q90 226 150 240 T260 244 L260 260 L40 260 Z" fill={P.groundDark} />
      <Shrub x={90} y={236} />
      <Shrub x={140} y={242} s={0.8} tone={P.pineDark} />
      <Shrub x={205} y={240} s={0.9} />
      <Blooms x={120} y={225} />
      <Blooms x={220} y={230} />
    </Base>
  ),
  patio: (
    <Base>
      <Tree x={44} y={168} s={1} />
      <Tree x={368} y={172} s={0.8} round />
      <g>
        {Array.from({ length: 4 }).map((_, r) =>
          Array.from({ length: 6 }).map((_, c) => (
            <rect
              key={`${r}-${c}`}
              x={110 + c * 32 + (r % 2 ? 16 : 0)}
              y={200 + r * 14}
              width={30}
              height={12}
              rx={2}
              fill={(r + c) % 2 ? P.paver : P.paverDark}
            />
          ))
        )}
      </g>
      <circle cx="200" cy="192" r="10" fill={P.clay} />
      <circle cx="200" cy="192" r="5" fill={P.bloom3} />
      <Shrub x={92} y={238} s={0.9} />
      <Shrub x={330} y={242} s={0.9} tone={P.pineDark} />
    </Base>
  ),
  drainage: (
    <Base>
      <Tree x={70} y={166} s={1} />
      <Tree x={330} y={160} s={1.05} />
      <path d="M150 180 Q180 210 160 232 T190 260 L230 260 Q200 236 224 214 T210 180 Z" fill={P.water} />
      {[168, 186, 204, 224, 244].map((y, i) => (
        <circle key={y} cx={166 + (i % 2) * 34 + 8} cy={y + 14} r="4" fill={P.paverDark} />
      ))}
      <Shrub x={120} y={230} s={0.8} />
      <Shrub x={272} y={236} s={0.9} tone={P.pineDark} />
    </Base>
  ),
  fence: (
    <Base>
      <Tree x={52} y={170} s={0.95} />
      <g>
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x={112 + i * 26} y={168} width={14} height={64} rx={3} fill={P.fence} />
        ))}
        <rect x={106} y={178} width={236} height={8} rx={3} fill={P.paverDark} />
        <rect x={106} y={210} width={236} height={8} rx={3} fill={P.paverDark} />
      </g>
      <Shrub x={140} y={244} s={0.85} />
      <Shrub x={250} y={248} s={0.9} tone={P.pineDark} />
      <Blooms x={320} y={244} />
    </Base>
  ),
  cleanup: (
    <Base>
      <Tree x={320} y={164} s={1.1} />
      <g fill={P.clay}>
        <ellipse cx="120" cy="238" rx="26" ry="10" opacity="0.85" />
        <ellipse cx="146" cy="230" rx="18" ry="7" opacity="0.7" />
      </g>
      {[
        [96, 224], [130, 218], [158, 226], [112, 210],
      ].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} q4 -8 10 0 q-6 6 -10 0`} fill={P.bloom1} />
      ))}
      <g transform="translate(230 216)">
        <rect x="0" y="0" width="30" height="26" rx="4" fill={P.pineDark} />
        <circle cx="6" cy="30" r="6" fill="#21302a" />
        <circle cx="24" cy="30" r="6" fill="#21302a" />
        <rect x="28" y="-10" width="5" height="18" rx="2" fill={P.trunk} transform="rotate(24 30 0)" />
      </g>
      <Shrub x={62} y={244} s={0.9} />
    </Base>
  ),
  lawn: (
    <Base>
      <Tree x={356} y={166} s={0.9} round />
      <g>
        {Array.from({ length: 6 }).map((_, i) => (
          <path
            key={i}
            d={`M${20 + i * 62} 260 L${58 + i * 62} 198 L${82 + i * 62} 198 L${52 + i * 62} 260 Z`}
            fill={i % 2 ? P.ground : P.groundDark}
            opacity={i % 2 ? 1 : 0.55}
          />
        ))}
      </g>
      <Shrub x={40} y={220} s={0.8} />
      <Blooms x={90} y={212} />
    </Base>
  ),
  home: (
    <Base>
      <g transform="translate(150 130)">
        <rect x="0" y="30" width="110" height="72" fill="#f6f1e6" stroke={P.paverDark} strokeWidth="2" />
        <path d="M-10 32 L55 -12 L120 32 Z" fill={P.clay} />
        <rect x="14" y="52" width="22" height="22" fill={P.water} stroke={P.paverDark} strokeWidth="2" />
        <rect x="74" y="52" width="22" height="22" fill={P.water} stroke={P.paverDark} strokeWidth="2" />
        <rect x="45" y="64" width="20" height="38" fill={P.pineDark} />
      </g>
      <Tree x={92} y={172} s={1.15} />
      <Tree x={330} y={168} s={1} />
      <path d="M195 232 Q200 246 190 260 L230 260 Q222 244 225 232 Z" fill={P.paver} />
      <Shrub x={150} y={238} s={0.85} />
      <Shrub x={280} y={238} s={0.85} tone={P.pineDark} />
      <Blooms x={130} y={228} />
      <Blooms x={300} y={226} />
    </Base>
  ),
};

export function Scene({
  variant,
  photo,
  alt,
  className = "",
  priority = false,
}: {
  variant: SceneVariant;
  photo?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  if (photo) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={photo} alt={alt} fill className="object-cover" priority={priority} />
      </div>
    );
  }
  return (
    <div className={`overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 400 260"
        role="img"
        aria-label={alt}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {scenes[variant]}
      </svg>
    </div>
  );
}
