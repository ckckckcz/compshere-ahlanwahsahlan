"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { cn } from "@/lib/utils"

type Item = { label: string; value: string }

export function InfoCard({
  title,
  items,
  columns = 1,
  className,
  loading = false,
}: {
  title: string
  items: Item[]
  columns?: 1 | 2 | 3 | 4
  className?: string
  loading?: boolean
}) {
  return (
    <Card className={cn("relative p-4 md:p-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
        <Button variant="ghost" size="icon" aria-label={`Edit ${title}`} disabled={loading}>
          <Pencil className="size-4" />
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-md bg-muted/40 p-3 animate-pulse">
              <div className="h-3 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "grid",
            {
              "grid-cols-1": columns === 1,
              "grid-cols-2": columns === 2,
              "grid-cols-3": columns === 3,
              "grid-cols-4": columns === 4,
            },
            "md:gap-4",
          )}
        >
          {items.map((it) => (
            <div key={it.label} className="rounded-md bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">{it.label}</p>
              <p className="mt-1 text-sm font-medium">{it.value}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
