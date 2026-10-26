import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const setupFile = path.join(configDir, 'vitest.setup.ts');
const qaTestHelper = path.join(configDir, 'qa-test.ts');

const reportFile =
  process.env.AI_TESTING_TOOL_FILE_PATH ??
  path.join(configDir, 'ai-testing-tool-results.json');

/**
 * When GitHub Actions / CI runs `npx vitest run --reporter=json --outputFile=ai-testing-tool-results.json`,
 * Vitest CLI flags override `test.reporters` with `[['json', {}]]`, which strips `meta.qa`
 * (issueKeys, suite, steps, host). This hook swaps the CLI `json` reporter for
 * `@ai-testing-tool/forge-vitest` writing to the requested `--outputFile`.
 */
const aiTestingToolCliBridgePlugin = {
  name: 'ai-testing-tool-cli-bridge',
  configureVitest({
    vitest,
  }: {
    vitest: {
      config: {
        reporters: unknown[];
        outputFile?: string | Record<string, string>;
      };
    };
  }) {
    const hasForgeReporter = vitest.config.reporters.some(
      (r) =>
        r === '@ai-testing-tool/forge-vitest' ||
        (Array.isArray(r) && r[0] === '@ai-testing-tool/forge-vitest'),
    );
    if (hasForgeReporter) return;

    const cliOutFile =
      typeof vitest.config.outputFile === 'string'
        ? vitest.config.outputFile
        : vitest.config.outputFile?.json;
    const outPath = cliOutFile
      ? path.resolve(configDir, cliOutFile)
      : reportFile;

    vitest.config.outputFile = undefined;
    vitest.config.reporters = [
      ['default', {}],
      [
        '@ai-testing-tool/forge-vitest',
        {
          mode: 'file',
          projectKey: process.env.AI_TESTING_TOOL_PROJECT_KEY ?? 'TODO',
          launchName:
            process.env.AI_TESTING_TOOL_LAUNCH_NAME ??
            'React Todo Example Smoke (v1.0.0 - Sprint 1)',
          file: { path: outPath },
        },
      ],
    ];
  },
};

export default defineConfig({
  plugins: [aiTestingToolCliBridgePlugin],
  resolve: {
    alias: {
      '@qa/test': qaTestHelper,
    },
  },
  test: {
    name: 'todo-react-qa',
    root: configDir,
    include: ['test/**/*.test.{ts,tsx}', 'tests/qa/**/*.test.{ts,tsx}'],
    setupFiles: [setupFile],
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
