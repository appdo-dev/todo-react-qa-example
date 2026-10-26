export type TodoPriority = 'low' | 'medium' | 'high';
export type TodoFilter = 'all' | 'active' | 'completed';

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: TodoPriority;
  createdAt: number;
}

export interface TodoStats {
  total: number;
  active: number;
  completed: number;
  completionRate: number;
}

const MAX_TITLE_LENGTH = 120;

export function createTodo(
  items: readonly TodoItem[],
  rawTitle: string,
  priority: TodoPriority = 'medium',
): { ok: true; items: TodoItem[]; created: TodoItem } | { ok: false; error: string } {
  const title = rawTitle.trim();
  if (!title) {
    return { ok: false, error: 'EMPTY_TITLE' };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { ok: false, error: 'TITLE_TOO_LONG' };
  }
  const duplicate = items.some(
    (item) => !item.completed && item.title.toLowerCase() === title.toLowerCase(),
  );
  if (duplicate) {
    return { ok: false, error: 'DUPLICATE_ACTIVE_TODO' };
  }

  const created: TodoItem = {
    id: `todo-${items.length + 1}`,
    title,
    completed: false,
    priority,
    createdAt: Date.now(),
  };

  return {
    ok: true,
    items: [...items, created],
    created,
  };
}

export function toggleTodo(items: readonly TodoItem[], id: string): TodoItem[] {
  return items.map((item) =>
    item.id === id ? { ...item, completed: !item.completed } : item,
  );
}

export function deleteTodo(items: readonly TodoItem[], id: string): TodoItem[] {
  return items.filter((item) => item.id !== id);
}

export function clearCompletedTodos(items: readonly TodoItem[]): TodoItem[] {
  return items.filter((item) => !item.completed);
}

export function filterTodos(
  items: readonly TodoItem[],
  filter: TodoFilter = 'all',
  searchQuery = '',
): TodoItem[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return items.filter((item) => {
    if (filter === 'active' && item.completed) return false;
    if (filter === 'completed' && !item.completed) return false;
    if (normalizedQuery && !item.title.toLowerCase().includes(normalizedQuery)) {
      return false;
    }
    return true;
  });
}

export function getTodoStats(items: readonly TodoItem[]): TodoStats {
  const total = items.length;
  const completed = items.filter((item) => item.completed).length;
  const active = total - completed;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, active, completed, completionRate };
}
