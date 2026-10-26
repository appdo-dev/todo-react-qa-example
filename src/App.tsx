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
      title: 'Setup @ai-testing-tool/forge-vitest reporter',
      completed: true,
      priority: 'high',
      createdAt: Date.now() - 3600_000,
    },
    {
      id: 'todo-2',
      title: 'Sync Todo test results to Jira Space APPDO',
      completed: false,
      priority: 'high',
      createdAt: Date.now() - 1800_000,
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
    <main style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>React Todo App — QA Example</h1>
      <p>
        Total: <strong>{stats.total}</strong> | Active: <strong>{stats.active}</strong> | Completed:{' '}
        <strong>{stats.completed}</strong> ({stats.completionRate}%)
      </p>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          aria-label="Todo title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          style={{ flex: 1, padding: 8 }}
        />
        <select
          aria-label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TodoPriority)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit">Add Todo</button>
      </form>

      {error && (
        <div role="alert" style={{ color: '#b91c1c', marginBottom: 12 }}>
          Error: {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{ fontWeight: filter === f ? 'bold' : 'normal' }}
          >
            {f.toUpperCase()}
          </button>
        ))}
        <input
          aria-label="Search todos"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          style={{ marginLeft: 'auto', padding: 4 }}
        />
        <button type="button" onClick={() => setItems(clearCompletedTodos(items))}>
          Clear Completed
        </button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {visibleTodos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 0',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => setItems(toggleTodo(items, todo.id))}
            />
            <span
              style={{
                flex: 1,
                textDecoration: todo.completed ? 'line-through' : 'none',
              }}
            >
              [{todo.priority.toUpperCase()}] {todo.title}
            </span>
            <button type="button" onClick={() => setItems(deleteTodo(items, todo.id))}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
export default App;
