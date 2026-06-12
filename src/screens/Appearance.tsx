import { useEffect, useState } from 'react';
import { Icons } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { useTheme } from '@/lib/theme';
import {
  useAppearance,
  THEMES,
  BACKGROUNDS,
  FONT_SIZES,
  type ColorTheme,
  type BgTheme,
  type FontSize,
} from '@/lib/appearance';
import { Button, Card, Badge, Avatar, Toggle } from '@/ui/components';
import { PlanBadge } from '@/components/PlanBadge';

/* ------------------------------------------------------------------ */
/*  Building blocks                                                     */
/* ------------------------------------------------------------------ */

function SectionHeader({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof Icons.Moon;
  title: string;
  hint: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <Icon size={18} strokeWidth={2.25} className="mt-0.5 shrink-0 text-brand" />
      <div>
        <h2 className="text-sm font-extrabold text-ink">{title}</h2>
        <p className="mt-0.5 text-xs text-ink-soft">{hint}</p>
      </div>
    </div>
  );
}

function ModeCard({
  active,
  onClick,
  icon: Icon,
  label,
  scheme,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Icons.Sun;
  label: string;
  scheme: 'light' | 'dark';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'focus-ring group relative flex flex-1 flex-col gap-3 overflow-hidden rounded-2xl border p-3 text-left transition',
        active ? 'border-brand ring-1 ring-brand' : 'border-line/12 hover:border-line/30',
      )}
    >
      {/* mini window preview, hard-coded to its scheme so both always show */}
      <div
        className={cn(
          'flex h-20 flex-col gap-1.5 rounded-xl border p-2.5',
          scheme === 'light' ? 'border-black/5 bg-[#E9F0EC]' : 'border-white/10 bg-[#09101a]',
        )}
      >
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand" />
          <span
            className={cn(
              'h-1.5 w-12 rounded-full',
              scheme === 'light' ? 'bg-black/15' : 'bg-white/25',
            )}
          />
        </div>
        <span className={cn('h-1.5 w-full rounded-full', scheme === 'light' ? 'bg-black/10' : 'bg-white/15')} />
        <span className={cn('h-1.5 w-3/4 rounded-full', scheme === 'light' ? 'bg-black/10' : 'bg-white/15')} />
        <span className="mt-auto h-3.5 w-14 rounded-md bg-brand" />
      </div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
          <Icon size={15} strokeWidth={2.2} />
          {label}
        </span>
        {active && <Icons.CheckCircle2 size={16} className="text-brand" />}
      </div>
    </button>
  );
}

function ThemeSwatch({
  theme,
  active,
  onClick,
}: {
  theme: (typeof THEMES)[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${theme.label} theme`}
      className={cn(
        'focus-ring group relative flex flex-col items-center gap-2 rounded-2xl border p-3 transition',
        active ? 'border-brand ring-1 ring-brand' : 'border-line/12 hover:border-line/30',
      )}
    >
      <span
        className="h-11 w-11 rounded-full ring-1 ring-black/5"
        style={{ backgroundImage: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
      />
      <span className="text-xs font-bold text-ink">{theme.label}</span>
      {theme.kind === 'gradient' && (
        <span className="text-[9px] font-bold uppercase tracking-wide text-ink-mute">Gradient</span>
      )}
      {active && (
        <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-brand text-white">
          <Icons.Check size={11} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function BgSwatch({
  bg,
  active,
  onClick,
}: {
  bg: (typeof BACKGROUNDS)[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${bg.label} background`}
      className={cn(
        'focus-ring group relative flex flex-col items-center gap-2 rounded-2xl border p-3 transition',
        active ? 'border-brand ring-1 ring-brand' : 'border-line/12 hover:border-line/30',
      )}
    >
      <span
        className="grid h-14 w-full grid-cols-3 overflow-hidden rounded-xl ring-1 ring-black/5"
        style={{ backgroundColor: bg.canvas }}
      >
        <span
          className="h-full"
          style={{ backgroundColor: bg.canvas }}
        />
        <span
          className="h-full"
          style={{ backgroundColor: bg.surface }}
        />
        <span
          className="h-full"
          style={{ backgroundColor: bg.surface2 }}
        />
      </span>
      <span className="text-xs font-bold text-ink">{bg.label}</span>
      {active && (
        <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-brand text-white">
          <Icons.Check size={11} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function FontSizeSlider({
  value,
  onChange,
  appliedValue,
  onApply,
}: {
  value: FontSize;
  onChange: (size: FontSize) => void;
  appliedValue: FontSize;
  onApply: () => void;
}) {
  const activeIndex = Math.max(0, FONT_SIZES.findIndex((size) => size.id === value));
  const progress = (activeIndex / (FONT_SIZES.length - 1)) * 100;
  const dirty = value !== appliedValue;

  return (
    <div className="pt-2">
      <div className="relative pb-8 pt-5">
        <div className="absolute left-0 right-0 top-8 h-1 -translate-y-1/2 rounded-full bg-line/12" />
        <div
          className="absolute left-0 top-8 h-1 -translate-y-1/2 rounded-full bg-brand"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute left-0 right-0 top-8 flex -translate-y-1/2 justify-between">
          {FONT_SIZES.map((size) => (
            <span
              key={size.id}
              className={cn(
                'h-3 w-px rounded-full',
                size.id === value ? 'bg-brand' : 'bg-line/25',
              )}
            />
          ))}
        </div>
        <span
          className="pointer-events-none absolute top-8 z-10 h-8 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-brand shadow-glass"
          style={{ left: `${progress}%` }}
        />
        <input
          type="range"
          min={0}
          max={FONT_SIZES.length - 1}
          step={1}
          value={activeIndex}
          onChange={(event) => onChange(FONT_SIZES[Number(event.target.value)].id)}
          aria-label="Font size"
          className="appearance-font-slider absolute inset-x-0 top-5 z-20 h-6 w-full cursor-pointer appearance-none bg-transparent opacity-0"
        />
        <div className="absolute left-0 right-0 top-11 flex justify-between">
          {FONT_SIZES.map((size) => (
            <span
              key={size.id}
              className={cn(
                'text-[10px] font-bold',
                size.id === value ? 'text-brand' : 'text-ink-mute',
              )}
            >
              {size.label}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button size="sm" icon={Icons.Check} onClick={onApply} disabled={!dirty}>
          Apply
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Live preview                                                        */
/* ------------------------------------------------------------------ */

function LivePreview({ previewFontSize }: { previewFontSize: FontSize }) {
  return (
    <Card className="overflow-hidden border-line/10 p-0">
      <div className="flex items-center justify-between border-b border-line/10 bg-surface-2 px-4 py-2.5">
        <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-mute">
          <Icons.Eye size={13} /> Live preview
        </span>
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-line/20" />
          <span className="h-2 w-2 rounded-full bg-line/20" />
          <span className="h-2 w-2 rounded-full bg-brand" />
        </div>
      </div>

      <div className="space-y-4 p-5" style={{ fontSize: `${previewFontSize}px` }}>
        <div className="flex items-center gap-3">
          <Avatar name="Avery Quinn" size={40} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[0.875em] font-bold text-ink">Avery Quinn</p>
              <PlanBadge plan="pro" size="xs" />
            </div>
            <p className="truncate text-[0.75em] text-ink-mute">Frontend Engineer</p>
          </div>
        </div>

        <div>
          <h3 className="font-display text-[1.25em] font-black tracking-tight text-ink">
            Map your <span className="text-gradient">career trajectory</span>.
          </h3>
          <p className="mt-1.5 text-[0.875em] leading-relaxed text-ink-soft">
            This is how body copy, links, and accents look. Adjust the theme and font size to see
            the whole interface respond — your{' '}
            <a href="#" className="font-semibold text-brand hover:underline">
              brand color
            </a>{' '}
            flows everywhere.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-[0.75em] font-bold text-brand">
            <Icons.Sparkles size={13} />
            Recommended
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/15 px-2.5 py-1 text-[0.75em] font-bold text-[#8a6530] dark:text-amber">
            <Icons.Flame size={13} />
            High demand
          </span>
          <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[0.75em] font-bold text-brand">
            92% match
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-line/10">
          <div className="h-full w-[72%] rounded-full bg-brand-gradient" />
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-3 py-2 text-[0.875em] font-bold text-white">
            <Icons.Route size={15} />
            Primary action
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-line/12 bg-surface px-3 py-2 text-[0.875em] font-bold text-ink-soft">
            <Icons.Bookmark size={15} />
            Secondary
          </button>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function Appearance() {
  const { theme, setTheme } = useTheme();
  const {
    colorTheme,
    setColorTheme,
    bgTheme,
    setBgTheme,
    fontSize,
    setFontSize,
    autoOpenChat,
    setAutoOpenChat,
    reset,
  } = useAppearance();
  const [draftFontSize, setDraftFontSize] = useState<FontSize>(fontSize);

  useEffect(() => {
    setDraftFontSize(fontSize);
  }, [fontSize]);

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge tone="brand" icon={Icons.Wand2}>
            Appearance
          </Badge>
          <h1 className="mt-2.5 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Make CareerOS yours
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-ink-soft">
            Choose light or dark, pick a color theme, and set a comfortable text size. Font changes
            update the preview first, then apply across the app when you confirm.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setTheme('light');
            reset();
            setDraftFontSize(16);
          }}
          className="focus-ring flex items-center gap-1.5 rounded-xl border border-line/12 px-3 py-1.5 text-xs font-semibold text-ink-mute transition hover:bg-line/5 hover:text-ink"
        >
          <Icons.Activity size={14} />
          Reset to defaults
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(20rem,22rem)] lg:items-start">
        {/* Controls */}
        <div className="space-y-5">
          {/* Mode */}
          <Card className="border-line/10 p-5">
            <SectionHeader icon={Icons.Moon} title="Mode" hint="Light keeps it bright; dark is easier at night." />
            <div className="flex gap-3">
              <ModeCard
                active={theme === 'light'}
                onClick={() => setTheme('light')}
                icon={Icons.Sun}
                label="Light"
                scheme="light"
              />
              <ModeCard
                active={theme === 'dark'}
                onClick={() => setTheme('dark')}
                icon={Icons.Moon}
                label="Dark"
                scheme="dark"
              />
            </div>
          </Card>

          {/* Color theme */}
          <Card className="border-line/10 p-5">
            <SectionHeader
              icon={Icons.Sparkles}
              title="Color theme"
              hint="Recolors the whole interface — solid tones and gradient blends."
            />
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {THEMES.map((t) => (
                <ThemeSwatch
                  key={t.id}
                  theme={t}
                  active={colorTheme === t.id}
                  onClick={() => setColorTheme(t.id as ColorTheme)}
                />
              ))}
            </div>
          </Card>

          {/* Background */}
          <Card className="border-line/10 p-5">
            <SectionHeader
              icon={Icons.Layers}
              title="Background"
              hint="Sets the canvas and surface tone behind everything."
            />
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
              {BACKGROUNDS.map((b) => (
                <BgSwatch
                  key={b.id}
                  bg={b}
                  active={bgTheme === b.id}
                  onClick={() => setBgTheme(b.id as BgTheme)}
                />
              ))}
            </div>
          </Card>

          {/* Font size */}
          <Card className="border-line/10 p-5">
            <SectionHeader icon={Icons.Languages} title="Font size" hint="Scales text across every screen." />
            <FontSizeSlider
              value={draftFontSize}
              appliedValue={fontSize}
              onChange={setDraftFontSize}
              onApply={() => setFontSize(draftFontSize)}
            />
          </Card>

          {/* Messaging */}
          <Card className="border-line/10 p-5">
            <SectionHeader
              icon={Icons.MessageSquare}
              title="Messaging"
              hint="Control how your mentor conversations behave across the app."
            />
            <label
              htmlFor="auto-open-chat"
              className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-line/12 p-3.5 transition hover:border-line/25"
            >
              <span>
                <span className="block text-sm font-bold text-ink">Auto-open chats on the Mentors page</span>
                <span className="mt-0.5 block text-xs text-ink-soft">
                  Pop the messages window open automatically whenever you visit Mentors.
                </span>
              </span>
              <Toggle
                id="auto-open-chat"
                checked={autoOpenChat}
                onChange={setAutoOpenChat}
                label="Auto-open chats on the Mentors page"
              />
            </label>
          </Card>
        </div>

        {/* Sticky preview */}
        <div className="lg:sticky lg:top-20">
          <LivePreview previewFontSize={draftFontSize} />
        </div>
      </div>
    </div>
  );
}
