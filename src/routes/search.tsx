import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "@/components/aqua/pages";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: String(s.q ?? "") }),
  component: () => {
    const { q } = Route.useSearch();
    return <SearchPage q={q} />;
  },
});
