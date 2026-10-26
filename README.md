# React Todo App — QA Integration Example (`todo-react-qa-example`)

[![AI Testing Tool](https://f273d312-579c-464c-aafd-0b4bed2d36b4.webtrigger.atlassian.app/public/kh4ZJ-wV1K7W46QOdvIbcTgofYY?format=svg&projectKey=TODO&gitBranch=main)](https://f273d312-579c-464c-aafd-0b4bed2d36b4.webtrigger.atlassian.app/public/kh4ZJ-wV1K7W46QOdvIbcTgofYY?format=svg&projectKey=TODO&gitBranch=main)

End-to-end **React 19 + TypeScript + Vite (Todo App)** reference project demonstrating how to integrate a React application with:
1. **[`testing-tool-js/examples/single/vitest`](https://github.com/ai-testing-tool/testing-tool-js/tree/main/examples/single/vitest)** (`@ai-testing-tool/forge-vitest`, `@ai-testing-tool/forge-commons`, `@ai-testing-tool/forge-api-client`)
2. **AI Testing Tool for Jira Cloud (`qa-analyzer` — Jira Space `TODO`)**

---

## Step-by-Step Visual Walkthrough

### 1. Create sample project in GitHub : `todolist`
Public GitHub repository [`danhhoangjunior/todo-react-qa-example`](https://github.com/danhhoangjunior/todo-react-qa-example) initialized with a React 19 + TypeScript + Vite structure.

![Step 1 — Create sample project in GitHub](./docs/screenshots/todo_step1_github_repo.png)

---

### 2. Create Todolist UI in React
Interactive React Todo UI in [`src/App.tsx`](./src/App.tsx) backed by pure domain functions in [`src/lib/todo-store.ts`](./src/lib/todo-store.ts) (task creation, priority levels, status filtering, keyword search, and completion statistics).

![Step 2 — Create Todolist UI in React](./docs/screenshots/todo_step2_react_todolist_ui.png)

---

### 3. Write test for Todolist UI & Store
QA-annotated tests in [`test/todo-ui.test.tsx`](./test/todo-ui.test.tsx) (testing the `<App />` React UI component) and [`tests/qa/todo-app.test.ts`](./tests/qa/todo-app.test.ts) (testing Todo creation, validation, state transitions, and filtering), linked to Jira Requirement **`TODO-1`** via `qa.issueKeys(['TODO-1'])` and step-by-step `qa.step(...)` blocks.

![Step 3 — Write test for Todolist UI](./docs/screenshots/todo_step3_write_todolist_test.png)

---

### 4. Apply [`testing-tool-js/examples/single/vitest`](https://github.com/ai-testing-tool/testing-tool-js/tree/main/examples/single/vitest)
Applied the official Vitest pilot configuration from `testing-tool-js/examples/single/vitest`:
- [`vitest.config.ts`](./vitest.config.ts) with `aiTestingToolCliBridgePlugin` + `@ai-testing-tool/forge-vitest` reporter + `@qa/test` alias
- [`qa-test.ts`](./qa-test.ts) providing `qaDescribe`, `qaTest`, `qaIt`, and `withQa` wrappers
- [`vitest.setup.ts`](./vitest.setup.ts) & [`package.json`](./package.json) (`test`, `test:json`, `upload`, `qa:test`, `qa:ingest`)

![Step 4 — Apply testing-tool-js/examples/single/vitest](./docs/screenshots/todo_step4_apply_vitest_example.png)

---

### 5. Setup `github-action`
Configured [`.github/workflows/ai-testing-tool-vitest.yml`](./.github/workflows/ai-testing-tool-vitest.yml) along with repository Secrets (`AI_TESTING_TOOL_INGEST_URL`, `AI_TESTING_TOOL_INGEST_TOKEN`) and Variable (`JIRA_PROJECT_KEY=TODO`) to automatically execute Vitest and upload reports on every `push` and `pull_request`.

![Step 5 — Setup GitHub Action](./docs/screenshots/todo_step5_setup_github_action.png)

---

### 6. Setup Testing tool connection
Connected Jira Space **`Todo React QA` (`TODO`)** under **Testing tool → Apps → GitHub Actions → Setup** (`Connected · 200 OK`), generating the Forge Web Trigger Ingest Endpoint, Bearer Token, README Status Badge, and `.github/workflows/ai-testing-tool-vitest.yml` template.

![Step 6 — Setup Testing tool connection](./docs/screenshots/todo_step6_setup_testing_tool_connection.png)

---

### 7. Testing (Execution & Jira Sync)
Running `npm run qa:ingest` locally or via GitHub Actions executes all **5 tests (2 test files)**, uploads `ai-testing-tool-results.json` (`HTTP 201`), and syncs **5 `TestCase` issues (`TODO-2..5`, `TODO-10`)** and **5 `TestExecution` issues (`TODO-6..9`, `TODO-11`)** linked to Requirement **`TODO-1`**:

![Step 7a — Jira Space TODO Test Design](./docs/screenshots/todo_step7_testing_results.png)

![Step 7b — Jira Space TODO Test Execution](./docs/screenshots/todo_step7b_jira_execution.png)

---

## Quick Start

```bash
# Run QA tests locally and generate ai-testing-tool-results.json
npm run qa:test

# Run QA tests and upload report to Jira Space TODO
npm run qa:ingest
```

---

## License

Apache-2.0
