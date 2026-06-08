import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { Icons } from '@/lib/icons';
import {
  NODES,
  EDGES,
  CURRENT_NODE_ID,
  TARGET_NODE_ID,
  type CareerNode,
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
  className,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** ordered node ids to draw as the recommended/active route */
  highlightPath?: string[];
  filterKinds?: Set<string>;
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
    filterKinds && filterKinds.size > 0 && !filterKinds.has(n.kind);

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
            const r = isCurrent || isTarget ? 30 : 24;
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
                <circle
                  r={r}
                  fill="rgb(var(--c-surface))"
                  stroke={accent}
                  strokeWidth={sel ? 4 : 2.5}
                />
                {/* match arc */}
                <circle
                  r={r}
                  fill="none"
                  stroke={accent}
                  strokeOpacity={0.25}
                  strokeWidth={2.5}
                  strokeDasharray={`${(n.match / 100) * 2 * Math.PI * r} ${2 * Math.PI * r}`}
                  transform="rotate(-90)"
                />
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  fontSize={15}
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
      <div className="absolute left-4 top-4 hidden items-center gap-3 rounded-2xl border border-line/10 bg-surface/85 px-3.5 py-2 text-xs font-semibold text-ink-soft backdrop-blur-md sm:flex">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: ACCENT_HEX.teal }} /> You
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: ACCENT_HEX.amber }} /> Target
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full" style={{ background: ACCENT_HEX.amber }} /> Route
        </span>
      </div>
    </div>
  );
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
