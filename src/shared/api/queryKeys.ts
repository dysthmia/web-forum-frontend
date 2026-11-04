export const queryKeys = {
  categories: ['categories'] as const,
  topics: { all: ['topics'] as const, detail: (id: string) => ['topics', id] as const },
  users: { detail: (username: string) => ['users', username] as const },
} as const
