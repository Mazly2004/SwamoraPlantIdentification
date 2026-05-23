import { type ReactNode, useState, useRef, useEffect } from 'react'
import { GripVertical, MoreVertical, Trash2, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Widget } from '@/lib/farms'

interface WidgetFrameProps {
  widget: Widget
  title: string
  icon: ReactNode
  children: ReactNode
  className?: string
  dragHandleProps?: Record<string, unknown>
  dragAttributes?: Record<string, unknown>
  isDragging?: boolean
  onRemove?: () => void
  onResize?: (size: Widget['size']) => void
}

export function WidgetFrame({
  widget,
  title,
  icon,
  children,
  className,
  dragHandleProps,
  dragAttributes,
  isDragging,
  onRemove,
  onResize,
}: WidgetFrameProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  const canGrow = widget.size !== 'xl'
  const canShrink = widget.size !== 'sm'

  return (
    <section
      className={cn(
        'glass-card rounded-2xl p-4 relative group transition-shadow',
        isDragging && 'shadow-2xl ring-2 ring-[#caf26b]/60',
        className,
      )}
    >
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="glass-pill h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
            {icon}
          </div>
          <span className="text-sm font-medium truncate">{title}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Drag"
            className="glass-pill h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
            {...dragHandleProps}
            {...dragAttributes}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="Widget options"
              onClick={() => setMenuOpen((o) => !o)}
              className="glass-pill h-7 w-7 rounded-lg flex items-center justify-center"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-20 w-44 rounded-xl bg-white shadow-lg border border-neutral-200 py-1 text-sm">
                {onResize && canGrow && (
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center gap-2"
                    onClick={() => {
                      const order: Widget['size'][] = ['sm', 'md', 'lg', 'xl']
                      const next = order[Math.min(order.indexOf(widget.size) + 1, 3)]
                      onResize(next)
                      setMenuOpen(false)
                    }}
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    Make larger
                  </button>
                )}
                {onResize && canShrink && (
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center gap-2"
                    onClick={() => {
                      const order: Widget['size'][] = ['sm', 'md', 'lg', 'xl']
                      const next = order[Math.max(order.indexOf(widget.size) - 1, 0)]
                      onResize(next)
                      setMenuOpen(false)
                    }}
                  >
                    <Minimize2 className="h-3.5 w-3.5" />
                    Make smaller
                  </button>
                )}
                {onRemove && (
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600"
                    onClick={() => {
                      onRemove()
                      setMenuOpen(false)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mt-2">{children}</div>
    </section>
  )
}
