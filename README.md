# React Todo App — QA Integration Example (`todo-react-qa-example`)

Minimal **React 19 + TypeScript + Vite (Todo App)** reference project demonstrating how to integrate a product repository with:
1. **[`testing-tool-js`](https://github.com/ai-testing-tool/testing-tool-js)** (`@ai-testing-tool/forge-vitest`, `@ai-testing-tool/forge-commons`, `@ai-testing-tool/forge-api-client`)
2. **AI Testing Tool for Jira Cloud (`qa-analyzer`)**

---

## 1. Project Structure

```text
todo-react-qa-example/
├── src/
│   ├── lib/
│   │   └── todo-store.ts          # Core Todo domain logic (create, toggle, delete, filter, stats)
│   ├── App.tsx                    # React Todo App UI
│   └── main.tsx                   # React 19 entrypoint
├── tests/
│   └── qa/
│       └── todo-app.test.ts       # Vitest QA suite using `qa.*` metadata helpers
├── vitest.qa.config.ts            # Custom `@ai-testing-tool/forge-vitest` reporter configuration
├── .env.example                   # Sample environment variables for Jira Forge ingest
├── package.json                   # `qa:test` and `qa:ingest` scripts
└── README.md                      # Integration guide
```

---

## 2. Connecting to `testing-tool-js`

### 2.1. Install / Link Packages

In CI or standalone setups, install the reporter and CLI packages from npm:
```bash
npm install -D @ai-testing-tool/forge-vitest @ai-testing-tool/forge-commons @ai-testing-tool/forge-api-client vitest
```

In a local multi-repo workspace alongside `../testing-tool-js`, link the built packages directly:
```bash
mkdir -p node_modules/.bin
ln -sfn ../testing-tool-js/node_modules/@ai-testing-tool node_modules/@ai-testing-tool
ln -sfn ../testing-tool-js/node_modules/vitest node_modules/vitest
ln -sfn ../testing-tool-js/node_modules/@vitest node_modules/@vitest
ln -sfn ../testing-tool-js/node_modules/vitest/vitest.mjs node_modules/.bin/vitest
ln -sfn ../testing-tool-js/qa-forge-api-client/dist/cli.js node_modules/.bin/forge-api-client
```

### 2.2. Configure the Reporter ([`vitest.qa.config.ts`](./vitest.qa.config.ts))

```ts
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
```

### 2.3. Author Tests with `qa.*` Helpers ([`tests/qa/todo-app.test.ts`](./tests/qa/todo-app.test.ts))

```ts
import { expect, test } from 'vitest';
import { qa } from '@ai-testing-tool/forge-vitest/vitest';
import { createTodo } from '../../src/lib/todo-store';

test('Create Todo item with trimmed title and priority', async () => {
  await qa.issueKeys(['TODO-1']);
  await qa.suite('Todo Example App\tTask Creation');
  await qa.plan('Smoke');
  await qa.fixVersion('1.0.0');
  await qa.sprintName('Sprint 1');
  await qa.labels('todo-example,react,test-auto');
  await qa.fields({ layer: 'unit', severity: 'critical', priority: 'high' });
  await qa.parameters({ defaultPriority: 'medium', customPriority: 'high' });
  await qa.comment('Verify creating new Todo items trims whitespace and sets default state');

  await qa.step('create first Todo with trimmed title and default medium priority', async () => {
    const res = createTodo([], '  Write Vitest QA example docs  ');
    expect(res.ok).toBe(true);
  });
});
```

---

## 3. Running Tests & Publishing to Jira

### Local Test Run (writes `ai-testing-tool-results.json`):
```bash
npm run qa:test
```

### Run Tests & Upload Report to Jira Cloud:
```bash
AI_TESTING_TOOL_INGEST_URL="https://<your-forge-trigger>.webtrigger.atlassian.app/public/<trigger-id>" \
AI_TESTING_TOOL_INGEST_TOKEN="qa_<your-ingest-token>" \
npm run qa:ingest
```

---

## 4. Test Scenarios Included

| Suite Hierarchy | Test Case | Steps |
| :--- | :--- | :---: |
| `Todo Example App → Task Creation` | `Create Todo item with trimmed title and priority` | 2 |
| `Todo Example App → Task Creation` | `Reject empty, overlong, or duplicate active Todo titles` | 3 |
| `Todo Example App → State & Filtering` | `Toggle completion state, delete item, and clear completed Todos` | 3 |
| `Todo Example App → State & Filtering` | `Filter Todo items by status, search keyword, and compute completion stats` | 3 |

---

## License

Apache-2.0
