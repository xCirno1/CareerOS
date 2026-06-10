import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Icons, type LucideIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';

type Tone = 'default' | 'success' | 'info' | 'warn';
interface ToastOpts {
  icon?: LucideIcon;
  tone?: Tone;
  duration?: number;
}
interface ToastItem extends ToastOpts {
  id: number;
  message: string;
}

type ToastFn = (message: string, opts?: ToastOpts) => void;
const Ctx = createContext<ToastFn | null>(null);

const toneStyles: Record<Tone, string> = {
  default: 'text-brand',
  success: 'text-emerald-500',
  info: 'text-brand',
  warn: 'text-amber',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const toast = useCallback<ToastFn>((message, opts) => {
    const id = ++idRef.current;
    setItems((prev) => [...prev, { id, message, ...opts }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, opts?.duration ?? 2800);
  }, []);

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex w-[min(92vw,360px)] flex-col gap-2">
        {items.map((t) => {
          const Icon = t.icon ?? (t.tone === 'success' ? Icons.Check : Icons.Sparkles);
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex animate-fade-up items-center gap-3 rounded-2xl border border-line/12 bg-surface/95 px-4 py-3 shadow-glass backdrop-blur-xl"
            >
              <span
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-line/8',
                  toneStyles[t.tone ?? 'default'],
                )}
              >
                <Icon size={16} strokeWidth={2.4} />
              </span>
              <span className="text-sm font-semibold text-ink">{t.message}</span>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastFn {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
