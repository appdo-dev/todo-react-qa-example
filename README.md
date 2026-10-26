# React Todo App — QA Integration Example (`todo-react-qa-example`)

Dự án mẫu **React.js + TypeScript + Vite (Todo App)** minh họa cách kết nối một dự án sản phẩm với:
1. **[`testing-tool-js`](../testing-tool-js)** (`@ai-testing-tool/forge-vitest`, `@ai-testing-tool/forge-commons`, `@ai-testing-tool/forge-api-client`)
2. **[`qa-analyzer`](../qa-analyzer)** (Jira Forge App trên Jira Space **`APPDO`**)

Cấu trúc tích hợp hoàn toàn giống với [`app-studio-magic-79`](../app-studio-magic-79).

---

## 1. Cấu trúc thư mục

```text
todo-react-qa-example/
├── src/
│   ├── lib/
│   │   └── todo-store.ts          # Nghiệp vụ lõi Todo App (create, toggle, delete, filter, stats)
│   ├── App.tsx                    # Giao diện React Todo App
│   └── main.tsx                   # Entrypoint React 19
├── tests/
│   └── qa/
│       └── todo-app.test.ts       # Bộ test Vitest sử dụng helper `qa.*` chuẩn
├── vitest.qa.config.ts            # Cấu hình Custom Reporter `@ai-testing-tool/forge-vitest`
├── package.json                   # Scripts `qa:test` và `qa:ingest`
└── README.md                      # Tài liệu hướng dẫn tích hợp
```

---

## 2. Cách kết nối với `testing-tool-js`

### 2.1. Liên kết thư viện (`node_modules`)
Ở môi trường local (cùng thư mục cha `/Users/test/app/`), dự án liên kết trực tiếp tới các gói đã build của `testing-tool-js`:
```bash
mkdir -p node_modules/.bin
ln -sfn /Users/test/app/testing-tool-js/node_modules/@ai-testing-tool node_modules/@ai-testing-tool
ln -sfn /Users/test/app/testing-tool-js/node_modules/vitest node_modules/vitest
ln -sfn /Users/test/app/testing-tool-js/node_modules/@vitest node_modules/@vitest
ln -sfn /Users/test/app/testing-tool-js/node_modules/vitest/vitest.mjs node_modules/.bin/vitest
ln -sfn /Users/test/app/testing-tool-js/qa-forge-api-client/dist/cli.js node_modules/.bin/forge-api-client
```
*(Trên môi trường CI/CD, chỉ cần chạy `npm install -D @ai-testing-tool/forge-vitest @ai-testing-tool/forge-commons @ai-testing-tool/forge-api-client`).*

### 2.2. Cấu hình Reporter trong [`vitest.qa.config.ts`](./vitest.qa.config.ts)
```ts
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const configDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    name: 'todo-react-qa',
    root: configDir,
    include: ['tests/qa/**/*.test.ts'],
    reporters: [
      'default',
      [
        '@ai-testing-tool/forge-vitest',
        {
          mode: (process.env.AI_TESTING_TOOL_MODE as 'off' | 'file' | 'ingest' | undefined) ?? 'file',
          projectKey: process.env.AI_TESTING_TOOL_PROJECT_KEY ?? 'APPDO',
          launchName:
            process.env.AI_TESTING_TOOL_LAUNCH_NAME ??
            'React Todo Example Smoke (v1.0.0 - Sprint 1)',
          file: { path: path.join(configDir, 'ai-testing-tool-results.json') },
        },
      ],
    ],
  },
});
```

### 2.3. Mẫu viết Test đầy đủ trong [`tests/qa/todo-app.test.ts`](./tests/qa/todo-app.test.ts)
```ts
import { expect, test } from 'vitest';
import { qa } from '@ai-testing-tool/forge-vitest/vitest';
import { createTodo } from '../../src/lib/todo-store';

test('Create Todo item with trimmed title and priority', async () => {
  await qa.issueKeys(['APPDO-1']);
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

## 3. Chạy Test & Đồng bộ lên Jira (`qa-analyzer`)

### Chạy test dưới local (xuất file `ai-testing-tool-results.json`):
```bash
npm run qa:test
```

### Chạy test và đẩy thẳng lên Jira Space `APPDO`:
```bash
AI_TESTING_TOOL_INGEST_URL="https://51fcc599-49dd-4660-9a61-3a1404fae1f8.webtrigger.atlassian.app/public/X4cAACWzLnhwGrysK-6KsMHXcR8" \
AI_TESTING_TOOL_INGEST_TOKEN="<YOUR_INGEST_TOKEN>" \
npm run qa:ingest
```
