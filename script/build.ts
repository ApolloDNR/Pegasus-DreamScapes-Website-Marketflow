import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "@neondatabase/serverless",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  const sharedServerBuild = {
    platform: "node",
    bundle: true,
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  } as const;

  await Promise.all([
    esbuild({
      ...sharedServerBuild,
      entryPoints: ["server/index.ts"],
      format: "cjs",
      outfile: "dist/index.cjs",
    }),
    esbuild({
      ...sharedServerBuild,
      entryPoints: ["server/vercel-entry.ts"],
      format: "esm",
      outfile: "dist/vercel-server.mjs",
      banner: {
        js: [
          'import { fileURLToPath as __pegasusFileURLToPath } from "node:url";',
          'import { dirname as __pegasusDirname } from "node:path";',
          'import { createRequire as __pegasusCreateRequire } from "node:module";',
          "const require = __pegasusCreateRequire(import.meta.url);",
          "const __filename = __pegasusFileURLToPath(import.meta.url);",
          "const __dirname = __pegasusDirname(__filename);",
        ].join("\n"),
      },
    }),
  ]);
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
