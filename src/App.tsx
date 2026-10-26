import React, { useState } from 'react';
import {
  clearCompletedTodos,
  createTodo,
  deleteTodo,
  filterTodos,
  getTodoStats,
  toggleTodo,
  type TodoFilter,
  type TodoItem,
  type TodoPriority,
} from './lib/todo-store';

export function App() {
  const [items, setItems] = useState<TodoItem[]>([
    {
      id: 'todo-1',
      title: 'Configure @ai-testing-tool/forge-vitest reporter',
      completed: true,
      priority: 'high',
      createdAt: Date.now() - 3600_000,
    },
    {
      id: 'todo-2',
      title: 'Write QA annotated tests with qa.step & qa.issueKeys',
      completed: false,
      priority: 'high',
      createdAt: Date.now() - 1800_000,
    },
    {
      id: 'todo-3',
      title: 'Sync test execution report to Jira qa-analyzer (Space: TODO)',
      completed: false,
      priority: 'medium',
      createdAt: Date.now() - 900_000,
    },
  ]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const visibleTodos = filterTodos(items, filter, search);
  const stats = getTodoStats(items);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = createTodo(items, title, priority);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setItems(res.items);
    setTitle('');
    setError(null);
  }

  return (
    <main
      style={{
        maxWidth: 720,
        margin: '48px auto',
        padding: 32,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        background: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
        border: '1px solid #e2e8f0',
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: 999,
            background: '#eff6ff',
            color: '#1d4ed8',
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Jira Space: TODO (Requirement: TODO-1)
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, color: '#0f172a' }}>
          React Todo App — QA Example
        </h1>
        <p data-testid="todo-stats" style={{ margin: 0, color: '#475569', fontSize: 14 }}>
          Total: <strong>{stats.total}</strong> | Active: <strong>{stats.active}</strong> | Completed:{' '}
          <strong>{stats.completed}</strong> ({stats.completionRate}%)
        </p>
      </header>

      <form
        data-testid="todo-form"
        onSubmit={handleAdd}
        style={{ display: 'flex', gap: 10, marginBottom: 20 }}
      >
        <input
          data-testid="todo-input"
          aria-label="Todo title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            fontSize: 14,
          }}
        />
        <select
          data-testid="todo-priority"
          aria-label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TodoPriority)}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            background: '#f8fafc',
            fontSize: 14,
          }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button
          data-testid="todo-submit"
          type="submit"
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            border: 'none',
            background: '#2563eb',
            color: '#ffffff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Add Todo
        </button>
      </form>

      {error && (
        <div
          role="alert"
          data-testid="todo-error"
          style={{
            color: '#b91c1c',
            background: '#fef2f2',
            padding: '10px 14px',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          Error: {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            data-testid={`filter-${f}`}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              background: filter === f ? '#0f172a' : '#f8fafc',
              color: filter === f ? '#ffffff' : '#334155',
              fontWeight: filter === f ? 600 : 500,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {f.toUpperCase()}
          </button>
        ))}
        <input
          data-testid="todo-search"
          aria-label="Search todos"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          style={{
            marginLeft: 'auto',
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            fontSize: 13,
          }}
        />
        <button
          data-testid="clear-completed"
          type="button"
          onClick={() => setItems(clearCompletedTodos(items))}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#475569',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Clear Completed
        </button>
      </div>

      <ul data-testid="todo-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {visibleTodos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              marginBottom: 8,
              borderRadius: 10,
              background: todo.completed ? '#f8fafc' : '#ffffff',
              border: '1px solid #e2e8f0',
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => setItems(toggleTodo(items, todo.id))}
            />
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 700,
                background:
                  todo.priority === 'high'
                    ? '#fee2e2'
                    : todo.priority === 'medium'
                      ? '#fef3c7'
                      : '#e0f2fe',
                color:
                  todo.priority === 'high'
                    ? '#991b1b'
                    : todo.priority === 'medium'
                      ? '#92400e'
                      : '#075985',
              }}
            >
              {todo.priority.toUpperCase()}
            </span>
            <span
              style={{
                flex: 1,
                color: todo.completed ? '#94a3b8' : '#0f172a',
                textDecoration: todo.completed ? 'line-through' : 'none',
                fontSize: 14,
              }}
            >
              {todo.title}
            </span>
            <button
              type="button"
              onClick={() => setItems(deleteTodo(items, todo.id))}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid #fecaca',
                background: '#fff1f2',
                color: '#be123c',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
export default App;
