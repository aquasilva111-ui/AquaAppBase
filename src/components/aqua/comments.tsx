import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PersonChip } from "@/components/aqua/cards";
import { getProfile } from "@/lib/aqua/catalog";
import { useAqua } from "@/lib/aqua/store";
import type { Comment } from "@/lib/aqua/types";
import { formatRelative } from "@/lib/utils";

export function CommentThread({
  targetType,
  targetId,
}: {
  targetType: Comment["targetType"];
  targetId: string;
}) {
  const comments = useAqua((s) =>
    s.comments.filter((c) => c.targetType === targetType && c.targetId === targetId),
  );
  const add = useAqua((s) => s.addComment);
  const [text, setText] = useState("");

  return (
    <div className="space-y-3">
      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground">No notes on this yet.</p>
      )}
      {comments.map((c) => {
        const author = getProfile(c.authorId);
        if (!author) return null;
        return (
          <div key={c.id} className="flex gap-2">
            <PersonChip profile={author} />
            <div className="min-w-0 flex-1">
              <p className="text-sm">{c.text}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{formatRelative(c.at)}</p>
            </div>
          </div>
        );
      })}
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          const next = text.trim();
          if (!next) return;
          add({ targetType, targetId, text: next });
          setText("");
        }}
      >
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a note…"
          rows={3}
        />
        <Button type="submit" size="sm" disabled={!text.trim()}>
          Reply
        </Button>
      </form>
    </div>
  );
}
