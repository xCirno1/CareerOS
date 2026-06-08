import type { ReactNode, ElementType } from 'react';
import { useInView } from '@/lib/hooks';
import { cn } from '@/lib/cn';

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale';

const hidden: Record<Direction, string> = {
  up: 'translate-y-8 opacity-0',
  down: '-translate-y-8 opacity-0',
  left: 'translate-x-8 opacity-0',
  right: '-translate-x-8 opacity-0',
  scale: 'scale-95 opacity-0',
};

/**
 * Scroll-triggered reveal used for landing storytelling. Children animate in
 * the first time they enter the viewport; `delay` staggers siblings.
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  as,
  className,
  once = true,
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  as?: ElementType;
  className?: string;
  once?: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ once });
  const Tag = (as ?? 'div') as ElementType;
  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform',
        inView ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : hidden[direction],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
