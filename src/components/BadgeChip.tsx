import type { Badge } from '@/lib/badges'

export default function BadgeChip({ badge, size = 'sm' }: { badge: Badge; size?: 'sm' | 'xs' }) {
  const base = size === 'xs'
    ? 'text-[10px] px-1.5 py-0.5 gap-0.5'
    : 'text-xs px-2 py-0.5 gap-1'
  return (
    <span
      title={badge.descricao}
      className={`inline-flex items-center font-semibold rounded-full border ${badge.cor} ${base} whitespace-nowrap`}
    >
      {badge.emoji} {badge.label}
    </span>
  )
}
