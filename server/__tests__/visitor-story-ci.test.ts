import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

it('runs the bounded story journey gate and retains exact-head evidence in launch CI', () => {
  const workflow = readFileSync(resolve(import.meta.dirname, '../../.github/workflows/test.yml'), 'utf8');
  expect(workflow).toContain('run: node scripts/check-visitor-story.mjs');
  expect(workflow).toContain('VISITOR_STORY_SCREENSHOT_DIR: artifacts/visitor-story');
  expect(workflow).toContain('name: pegasus-visitor-story-${{ env.TESTED_SOURCE_SHA }}');
  expect(workflow).toContain('path: artifacts/visitor-story');
});
