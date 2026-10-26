import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const reportFile =
  process.env.AI_TESTING_TOOL_FILE_PATH ??
  path.join(configDir, 'ai-testing-tool-results.json');

export default defineConfig({
  test: {
    name: 'todo-react-qa',
    root: configDir,
    include: ['tests/qa/**/*.test.ts'],
    testTimeout: 15_000,
    reporters: [
      'default',
      [
        '@ai-testing-tool/forge-vitest',
        {
          mode: (process.env.AI_TESTING_TOOL_MODE as 'off' | 'file' | 'ingest' | undefined) ?? 'file',
          projectKey: process.env.AI_TESTING_TOOL_PROJECT_KEY ?? 'TODO',
          launchName:
            process.env.AI_TESTING_TOOL_LAUNCH_NAME ??
            'React Todo Example Smoke (v1.0.0 - Sprint 1)',
          file: { path: reportFile },
        },
      ],
    ],
  },
});
