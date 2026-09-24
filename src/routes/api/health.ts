import { createFileRoute } from "@tanstack/react-router";

/**
 * Deploy verification: `GET /api/health` answers which build is live, so a
 * Hostinger/Vercel deploy can be checked without guessing from the UI.
 */
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: () =>
        Response.json({
          ok: true,
          app: "AQUA",
          commit:
            process.env.VERCEL_GIT_COMMIT_SHA ??
            process.env.SOURCE_COMMIT ??
            process.env.COMMIT_SHA ??
            "unknown",
          features: [
            "experience-modes",
            "federation-at-readonly",
            "federation-ap-readonly",
            "global-player",
          ],
        }),
    },
  },
});
