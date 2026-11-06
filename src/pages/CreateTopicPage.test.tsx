import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../shared/api/errors.ts'
import { CreateTopicPage } from './CreateTopicPage.tsx'

const categoryState = vi.hoisted(() => ({
  data: [{ id: 7, name: 'Общее', slug: 'general', description: null }] as Array<{ id: number; name: string; slug: string; description: string | null }>,
  isPending: false,
  isError: false,
  error: new Error('Не удалось загрузить категории.'),
  refetch: vi.fn(),
}))
const forumApi = vi.hoisted(() => ({ createTopic: vi.fn() }))
const navigate = vi.hoisted(() => vi.fn())

vi.mock('../features/categories/api/queries.ts', () => ({ useCategoriesQuery: () => categoryState }))
vi.mock('../features/forum/api/forumApi.ts', () => ({ forumApi }))
vi.mock('react-router', async (importOriginal) => ({ ...await importOriginal<typeof import('react-router')>(), useNavigate: () => navigate }))

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}><CreateTopicPage /></QueryClientProvider>)
}

describe('CreateTopicPage', () => {
  beforeEach(() => {
    categoryState.data = [{ id: 7, name: 'Общее', slug: 'general', description: null }]
    categoryState.isPending = false
    categoryState.isError = false
    forumApi.createTopic.mockResolvedValue({ topicId: 12 })
  })

  it('does not send a request without a category', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Заголовок'), 'Тема')
    await user.type(screen.getByLabelText('Содержание'), 'Первое сообщение')
    await user.click(screen.getByRole('button', { name: 'Создать тему' }))

    expect(await screen.findByText('Выберите категорию.')).toBeInTheDocument()
    expect(forumApi.createTopic).not.toHaveBeenCalled()
  })

  it('blocks publishing when the category list is empty', () => {
    categoryState.data = []
    renderPage()

    expect(screen.getByText('Администратор ещё не создал категории.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Создать тему' })).toBeDisabled()
  })

  it('sends the selected category in the topic body', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.selectOptions(screen.getByLabelText(/Категория/), '7')
    await user.type(screen.getByLabelText('Заголовок'), 'Тема')
    await user.type(screen.getByLabelText('Содержание'), 'Первое сообщение')
    await user.click(screen.getByRole('button', { name: 'Создать тему' }))

    await waitFor(() => expect(forumApi.createTopic.mock.calls[0]?.[0]).toEqual({ categoryId: 7, title: 'Тема', content: 'Первое сообщение' }))
  })

  it('shows a server error to the user', async () => {
    const user = userEvent.setup()
    forumApi.createTopic.mockRejectedValue(new ApiError('RATE_LIMITED', 'Слишком много новых тем. Попробуйте позже.', 429))
    renderPage()

    await user.selectOptions(screen.getByLabelText(/Категория/), '7')
    await user.type(screen.getByLabelText('Заголовок'), 'Тема')
    await user.type(screen.getByLabelText('Содержание'), 'Первое сообщение')
    await user.click(screen.getByRole('button', { name: 'Создать тему' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Слишком много новых тем. Попробуйте позже.')
  })
})
