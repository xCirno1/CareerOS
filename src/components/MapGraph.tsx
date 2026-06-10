import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { Icons } from '@/lib/icons';
import {
  NODES,
  EDGES,
  CURRENT_NODE_ID,
  TARGET_NODE_ID,
  getNodeKindMeta,
  type CareerNode,
  type NodeKind,
} from '@/lib/mockData';

const ACCENT_HEX: Record<string, string> = {
  teal: '#2f7f8f',
  wine: '#7e3041',
  amber: '#f2b95e',
  navy: '#17324d',
};

interface Transform {
  x: number;
  y: number;
  k: number;
}

const CANVAS_W = 1000;
const CANVAS_H = 680;

export function MapGraph({
  selectedId,
  onSelect,
  highlightPath,
  filterKinds,
  focusIds,
  className,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** ordered node ids to draw as the recommended/active route */
  highlightPath?: string[];
  filterKinds?: Set<string>;
  /** when set, only these node ids stay lit (others dim) */
  focusIds?: Set<string>;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [t, setT] = useState<Transform>({ x: 30, y: 20, k: 0.74 });
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const fit = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const k = Math.min(width / CANVAS_W, height / CANVAS_H) * 0.92;
    setT({
      k,
      x: (width - CANVAS_W * k) / 2,
      y: (height - CANVAS_H * k) / 2,
    });
  }, []);

  useEffect(() => {
    fit();
  }, [fit]);

  const zoomAt = (factor: number, cx?: number, cy?: number) => {
    setT((prev) => {
      const el = wrapRef.current;
      const rect = el?.getBoundingClientRect();
      const px = cx ?? (rect ? rect.width / 2 : 0);
      const py = cy ?? (rect ? rect.height / 2 : 0);
      const k = Math.min(2.4, Math.max(0.4, prev.k * factor));
      return {
        k,
        x: px - (px - prev.x) * (k / prev.k),
        y: py - (py - prev.y) * (k / prev.k),
      };
    });
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = wrapRef.current?.getBoundingClientRect();
    zoomAt(
      e.deltaY < 0 ? 1.1 : 0.9,
      rect ? e.clientX - rect.left : undefined,
      rect ? e.clientY - rect.top : undefined,
    );
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, tx: t.x, ty: t.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setT((prev) => ({
      ...prev,
      x: drag.current!.tx + (e.clientX - drag.current!.x),
      y: drag.current!.ty + (e.clientY - drag.current!.y),
    }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const pathEdges = new Set<string>();
  if (highlightPath) {
    for (let i = 0; i < highlightPath.length - 1; i++) {
      pathEdges.add(`${highlightPath[i]}->${highlightPath[i + 1]}`);
      pathEdges.add(`${highlightPath[i + 1]}->${highlightPath[i]}`);
    }
  }

  const isDimmed = (n: CareerNode) =>
    (filterKinds && filterKinds.size > 0 && !filterKinds.has(n.kind)) ||
    (focusIds && focusIds.size > 0 && !focusIds.has(n.id));

  return (
    <div
      ref={wrapRef}
      className={cn(
        'relative h-full w-full touch-none overflow-hidden rounded-3xl border border-line/10 bg-surface-2',
        'cursor-grab active:cursor-grabbing',
        className,
      )}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgb(var(--c-line)/0.05) 1px,transparent 1px),linear-gradient(90deg,rgb(var(--c-line)/0.05) 1px,transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <svg className="absolute inset-0 h-full w-full">
        <g transform={`translate(${t.x},${t.y}) scale(${t.k})`}>
          {/* edges */}
          {EDGES.map((e, i) => {
            const a = NODES.find((n) => n.id === e.from)!;
            const b = NODES.find((n) => n.id === e.to)!;
            const onPath = pathEdges.has(`${e.from}->${e.to}`);
            const touchesSel =
              selectedId && (e.from === selectedId || e.to === selectedId);
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={onPath ? ACCENT_HEX.amber : 'rgb(var(--c-line))'}
                strokeOpacity={onPath ? 1 : touchesSel ? 0.4 : 0.16}
                strokeWidth={onPath ? 4 / 1 : touchesSel ? 2 : 1.3}
                strokeLinecap="round"
                strokeDasharray={onPath ? '1 9' : undefined}
                className={onPath ? 'animate-dash-flow' : undefined}
              />
            );
          })}

          {/* nodes */}
          {NODES.map((n) => {
            const sel = n.id === selectedId;
            const isCurrent = n.id === CURRENT_NODE_ID;
            const isTarget = n.id === TARGET_NODE_ID;
            const kindMeta = getNodeKindMeta(n.kind);
            const r = (isCurrent || isTarget ? 30 : 24) + (n.kind === 'career' ? 2 : 0);
            const accent = ACCENT_HEX[n.accent];
            const dim = isDimmed(n);
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                className="cursor-pointer"
                style={{ opacity: dim ? 0.25 : 1, transition: 'opacity 0.2s' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(n.id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {(isCurrent || isTarget) && (
                  <circle
                    r={r}
                    fill="none"
                    stroke={isTarget ? ACCENT_HEX.amber : ACCENT_HEX.teal}
                    strokeWidth={2}
                    className="animate-pulse-ring"
                  />
                )}
                {sel && (
                  <circle r={r + 8} fill="none" stroke={accent} strokeOpacity={0.4} strokeWidth={2} />
                )}
                <NodeKindShape kind={n.kind} r={r} accent={accent} selected={sel} />
                {/* match arc */}
                <circle
                  r={r + (n.kind === 'industry' ? 3 : 0)}
                  fill="none"
                  stroke={accent}
                  strokeOpacity={n.kind === 'career' ? 0.34 : 0.25}
                  strokeWidth={2.5}
                  strokeDasharray={`${(n.match / 100) * 2 * Math.PI * r} ${2 * Math.PI * r}`}
                  transform="rotate(-90)"
                />
                <KindGlyph kind={n.kind} accent={accent} />
                <text
                  textAnchor="middle"
                  y={11}
                  fontSize={13}
                  fontWeight={800}
                  fill="rgb(var(--c-ink))"
                >
                  {n.match}
                </text>
                <text
                  textAnchor="middle"
                  y={r + 16}
                  fontSize={13}
                  fontWeight={700}
                  fill="rgb(var(--c-ink))"
                >
                  {n.title}
                </text>
                <text
                  textAnchor="middle"
                  y={r + 31}
                  fontSize={9}
                  fontWeight={800}
                  fill={accent}
                >
                  {kindMeta.shortLabel.toUpperCase()}
                </text>
                {isCurrent && (
                  <text textAnchor="middle" y={-r - 10} fontSize={10} fontWeight={800} fill={ACCENT_HEX.teal} letterSpacing="1">
                    YOU
                  </text>
                )}
                {isTarget && (
                  <text textAnchor="middle" y={-r - 10} fontSize={10} fontWeight={800} fill={ACCENT_HEX.amber} letterSpacing="1">
                    TARGET
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
        <ZoomBtn icon={Icons.Plus} onClick={() => zoomAt(1.2)} label="Zoom in" />
        <ZoomBtn icon={Icons.Minus} onClick={() => zoomAt(0.83)} label="Zoom out" />
        <ZoomBtn icon={Icons.Maximize2} onClick={fit} label="Fit" />
      </div>

      {/* legend */}
      <div className="absolute left-4 top-4 hidden max-w-[min(760px,calc(100%-6rem))] flex-wrap items-center gap-3 rounded-2xl border border-line/10 bg-surface/85 px-3.5 py-2 text-xs font-semibold text-ink-soft backdrop-blur-md sm:flex">
        <LegendKind kind="job" />
        <LegendKind kind="career" />
        <LegendKind kind="industry" />
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full" style={{ background: ACCENT_HEX.amber }} /> Route
        </span>
      </div>
    </div>
  );
}

function NodeKindShape({
  kind,
  r,
  accent,
  selected,
}: {
  kind: NodeKind;
  r: number;
  accent: string;
  selected: boolean;
}) {
  const strokeWidth = selected ? 4 : 2.5;
  if (kind === 'career') {
    return (
      <polygon
        points={hexPoints(r)}
        fill="rgb(var(--c-surface))"
        stroke={accent}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    );
  }
  if (kind === 'industry') {
    return (
      <rect
        x={-r}
        y={-r}
        width={r * 2}
        height={r * 2}
        rx={9}
        fill="rgb(var(--c-surface))"
        stroke={accent}
        strokeWidth={strokeWidth}
        strokeDasharray="7 4"
      />
    );
  }
  return (
    <circle
      r={r}
      fill="rgb(var(--c-surface))"
      stroke={accent}
      strokeWidth={strokeWidth}
    />
  );
}

function KindGlyph({ kind, accent }: { kind: NodeKind; accent: string }) {
  const common = {
    stroke: accent,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
    opacity: 0.82,
  };

  if (kind === 'career') {
    return (
      <g transform="translate(0,-8)" {...common}>
        <path d="M-8 4 0 -4 8 4" />
        <path d="M0 -4V5" />
      </g>
    );
  }
  if (kind === 'industry') {
    return (
      <g transform="translate(0,-8)" {...common}>
        <path d="M-9 -1 0 -5 9 -1 0 3Z" />
        <path d="M-5 2v5c2.5 1.5 7.5 1.5 10 0V2" />
      </g>
    );
  }
  return (
    <g transform="translate(0,-8)" {...common}>
      <rect x={-8} y={-3} width={16} height={10} rx={2} />
      <path d="M-4 -3v-2h8v2" />
      <path d="M-8 1h16" />
    </g>
  );
}

function LegendKind({ kind }: { kind: NodeKind }) {
  const meta = getNodeKindMeta(kind);
  const color = kind === 'job' ? ACCENT_HEX.teal : kind === 'career' ? ACCENT_HEX.amber : ACCENT_HEX.navy;
  return (
    <span className="flex items-center gap-1.5">
      <svg width="16" height="16" viewBox="-10 -10 20 20" aria-hidden="true">
        <NodeKindShape kind={kind} r={7} accent={color} selected={false} />
      </svg>
      {meta.shortLabel}
    </span>
  );
}

function hexPoints(r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = Math.PI / 6 + i * (Math.PI / 3);
    return `${Math.cos(angle) * r},${Math.sin(angle) * r}`;
  }).join(' ');
}

function ZoomBtn({
  icon: Icon,
  onClick,
  label,
}: {
  icon: typeof Icons.Plus;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="focus-ring grid h-9 w-9 place-items-center rounded-xl border border-line/10 bg-surface text-ink-soft shadow-soft transition hover:text-ink"
    >
      <Icon size={17} strokeWidth={2.4} />
    </button>
  );
}
