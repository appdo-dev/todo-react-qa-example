import { describe, expect, test } from 'vitest';
import { qa } from '@ai-testing-tool/forge-vitest/vitest';
import {
  clearCompletedTodos,
  createTodo,
  deleteTodo,
  filterTodos,
  getTodoStats,
  toggleTodo,
  type TodoItem,
} from '../../src/lib/todo-store';

describe('React Todo App Example', () => {
  describe('Task Creation & Validation', () => {
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

      let list: TodoItem[] = [];

      await qa.step('create first Todo with trimmed title and default medium priority', async () => {
        const res = createTodo(list, '  Write Vitest QA example docs  ');
        expect(res.ok).toBe(true);
        if (res.ok) {
          list = res.items;
          expect(res.created.title).toBe('Write Vitest QA example docs');
          expect(res.created.priority).toBe('medium');
          expect(res.created.completed).toBe(false);
        }
      });

      await qa.step('create second Todo with explicit high priority', async () => {
        const res = createTodo(list, 'Connect Todo app to Jira Space APPDO', 'high');
        expect(res.ok).toBe(true);
        if (res.ok) {
          list = res.items;
          expect(list).toHaveLength(2);
          expect(res.created.priority).toBe('high');
        }
      });
    });

    test('Reject empty, overlong, or duplicate active Todo titles', async () => {
      await qa.issueKeys(['TODO-1']);
      await qa.suite('Todo Example App\tTask Creation');
      await qa.plan('Smoke');
      await qa.fixVersion('1.0.0');
      await qa.sprintName('Sprint 1');
      await qa.labels('todo-example,validation,test-auto');
      await qa.fields({ layer: 'unit', severity: 'normal', priority: 'medium' });
      await qa.parameters({ maxTitleLength: '120' });
      await qa.comment('Verify input validation rules for Todo creation');

      const initial = createTodo([], 'Deploy Forge app');
      const list = initial.ok ? initial.items : [];

      await qa.step('reject blank or whitespace-only title with EMPTY_TITLE', async () => {
        expect(createTodo(list, '   ')).toEqual({ ok: false, error: 'EMPTY_TITLE' });
      });

      await qa.step('reject title exceeding 120 characters with TITLE_TOO_LONG', async () => {
        const longTitle = 'A'.repeat(121);
        expect(createTodo(list, longTitle)).toEqual({ ok: false, error: 'TITLE_TOO_LONG' });
      });

      await qa.step('reject duplicate active Todo title (case-insensitive)', async () => {
        expect(createTodo(list, 'deploy forge app')).toEqual({
          ok: false,
          error: 'DUPLICATE_ACTIVE_TODO',
        });
      });
    });
  });

  describe('State Transitions & Filtering', () => {
    test('Toggle completion state, delete item, and clear completed Todos', async () => {
      await qa.issueKeys(['TODO-1']);
      await qa.suite('Todo Example App\tState & Filtering');
      await qa.plan('Smoke');
      await qa.fixVersion('1.0.0');
      await qa.sprintName('Sprint 1');
      await qa.labels('todo-example,state,test-auto');
      await qa.fields({ layer: 'unit', severity: 'critical', priority: 'high' });
      await qa.comment('Verify toggling, deleting, and bulk clearing completed tasks');

      const r1 = createTodo([], 'Task A', 'high');
      const r2 = createTodo(r1.ok ? r1.items : [], 'Task B', 'low');
      const r3 = createTodo(r2.ok ? r2.items : [], 'Task C', 'medium');
      let list = r3.ok ? r3.items : [];

      await qa.step('toggle Task A to completed', async () => {
        list = toggleTodo(list, 'todo-1');
        expect(list.find((t) => t.id === 'todo-1')?.completed).toBe(true);
      });

      await qa.step('clear all completed Todos and keep active ones', async () => {
        list = clearCompletedTodos(list);
        expect(list.map((t) => t.title)).toEqual(['Task B', 'Task C']);
      });

      await qa.step('delete Task B by id', async () => {
        list = deleteTodo(list, 'todo-2');
        expect(list.map((t) => t.title)).toEqual(['Task C']);
      });
    });

    test('Filter Todo items by status, search keyword, and compute completion stats', async () => {
      await qa.issueKeys(['TODO-1']);
      await qa.suite('Todo Example App\tState & Filtering');
      await qa.plan('Smoke');
      await qa.fixVersion('1.0.0');
      await qa.sprintName('Sprint 1');
      await qa.labels('todo-example,filtering,test-auto');
      await qa.fields({ layer: 'unit', severity: 'normal', priority: 'medium' });
      await qa.parameters({ filters: 'all,active,completed', search: 'jira' });
      await qa.comment('Verify status filter, keyword search, and completion rate calculation');

      const r1 = createTodo([], 'Write unit tests in Vitest');
      const r2 = createTodo(r1.ok ? r1.items : [], 'Upload report to Jira Space APPDO');
      let list = r2.ok ? r2.items : [];
      list = toggleTodo(list, 'todo-1');

      await qa.step('filter by active vs completed status', async () => {
        expect(filterTodos(list, 'active').map((t) => t.title)).toEqual([
          'Upload report to Jira Space APPDO',
        ]);
        expect(filterTodos(list, 'completed').map((t) => t.title)).toEqual([
          'Write unit tests in Vitest',
        ]);
      });

      await qa.step('filter by case-insensitive search keyword', async () => {
        expect(filterTodos(list, 'all', 'JIRA')).toHaveLength(1);
        expect(filterTodos(list, 'all', 'JIRA')[0]?.id).toBe('todo-2');
      });

      await qa.step('calculate total, active, completed, and completionRate %', async () => {
        expect(getTodoStats(list)).toEqual({
          total: 2,
          active: 1,
          completed: 1,
          completionRate: 50,
        });
      });
    });
  });
});
