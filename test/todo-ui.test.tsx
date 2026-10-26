import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { qaDescribe, qaTest, expect } from '@qa/test';
import { App } from '../src/App';

qaDescribe('Todo Example App > React UI Rendering', () => {
  qaTest('Render React Todo App UI with initial tasks, filter bar, and completion stats', async ({ qa }) => {
    await qa.issueKeys(['TODO-1']);
    await qa.suite('Todo Example App\tReact UI Rendering');
    await qa.plan('Smoke');
    await qa.fixVersion('1.0.0');
    await qa.sprintName('Sprint 1');
    await qa.labels('todo-app,react-ui,smoke');
    await qa.fields({
      layer: 'ui',
      severity: 'critical',
      priority: 'high',
    });
    await qa.parameters({
      renderer: 'react-dom/server',
      initialTasksCount: '3',
      defaultFilter: 'all',
    });
    await qa.comment(
      'Verifies that the React <App /> component renders the heading, task creation form, filter buttons, and initial seed tasks.',
    );

    let html = '';

    await qa.step('Step 1: Render <App /> component to HTML markup', async () => {
      html = renderToStaticMarkup(React.createElement(App));
      expect(html).toContain('React Todo App — QA Example');
    });

    await qa.step('Step 2: Verify task creation form and filter buttons in rendered UI', async () => {
      expect(html).toContain('data-testid="todo-form"');
      expect(html).toContain('data-testid="todo-input"');
      expect(html).toContain('data-testid="todo-priority"');
      expect(html).toContain('data-testid="filter-all"');
      expect(html).toContain('data-testid="filter-active"');
      expect(html).toContain('data-testid="filter-completed"');
    });

    await qa.step('Step 3: Verify initial seeded Todo items and summary statistics', async () => {
      expect(html).toContain('Configure @ai-testing-tool/forge-vitest reporter');
      expect(html).toContain('Write QA annotated tests with qa.step &amp; qa.issueKeys');
      expect(html).toContain('Sync test execution report to Jira qa-analyzer (Space: TODO)');
      expect(html).toContain('Total: <strong>3</strong>');
      expect(html).toContain('Active: <strong>2</strong>');
      expect(html).toContain('Completed: <strong>1</strong> (33%)');
    });
  });
});
