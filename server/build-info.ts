const BUILD_COMMIT_ENV_KEYS = [
  "APP_BUILD_COMMIT",
  "REPLIT_GIT_COMMIT",
  "REPLIT_COMMIT",
  "GIT_COMMIT",
  "COMMIT_SHA",
  "VERCEL_GIT_COMMIT_SHA",
  "RAILWAY_GIT_COMMIT_SHA",
  "RENDER_GIT_COMMIT",
] as const;

export type BuildInfo = {
  commit: string | null;
  shortCommit: string | null;
  source: string;
};

export function getBuildInfo(env: NodeJS.ProcessEnv = process.env): BuildInfo {
  for (const key of BUILD_COMMIT_ENV_KEYS) {
    const commit = normalizeCommit(env[key]);
    if (commit) {
      return {
        commit,
        shortCommit: commit.slice(0, 7),
        source: key,
      };
    }
  }

  return {
    commit: null,
    shortCommit: null,
    source: "unconfigured",
  };
}

function normalizeCommit(value: string | undefined) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return /^[0-9a-f]{7,40}$/.test(normalized) ? normalized : "";
}
