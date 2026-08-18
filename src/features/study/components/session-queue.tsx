import {Badge} from "@/components/ui/badge";
import {GlassCard} from "@/components/ui/glass-card";
import {EmptyState} from "@/components/ui/state-view";
import type {StudyQueueItem} from "@/features/vocabulary/types";

export function SessionQueue({items}: Readonly<{items: StudyQueueItem[]}>) {
  if (items.length === 0) {
    return <EmptyState title="Queue clear" description="No words are due right now." />;
  }

  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Queue</h2>
        <Badge variant="outline">{items.length}</Badge>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="glass-control flex items-start justify-between gap-3 rounded-[24px] p-4 transition duration-200 active:scale-[0.99]"
          >
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold">{item.term}</div>
              <div className="line-clamp-2 text-sm text-muted-foreground">{item.meaning}</div>
            </div>
            <Badge variant={item.kind === "new" ? "default" : "secondary"}>{item.deckName}</Badge>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
