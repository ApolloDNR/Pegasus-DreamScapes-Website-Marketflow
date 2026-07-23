import "@testing-library/jest-dom/vitest";

// Some deterministic Peggy unit suites import the production module to test
// exported prompts and guard functions. That module eagerly constructs the DB
// and OpenAI clients, even though those tests never make a query or model call.
// Keep the documented `npm test` command self-contained with loopback-only,
// test-scoped values while preserving any explicit environment supplied by CI.
process.env.DATABASE_URL ??= "postgresql://test:test@127.0.0.1:5432/pegasus_test";
process.env.AI_INTEGRATIONS_OPENAI_API_KEY ??= "test-only-key";
process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ??= "http://127.0.0.1:1";
