import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminCategoriesPage } from './AdminCategoriesPage.tsx'

const categoryApi = vi.hoisted(() => ({
  getList: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}))

vi.mock('../features/categories/api/categoriesApi.ts', () => ({ categoriesApi: categoryApi }))

const category = { id: 1, name: 'Общее', slug: 'general', description: 'Общие обсуждения' }

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function close() { this.removeAttribute('open') }
})

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}><AdminCategoriesPage /></QueryClientProvider>)
}

describe('AdminCategoriesPage', () => {
  beforeEach(() => {
    categoryApi.getList.mockResolvedValue([category])
    categoryApi.create.mockResolvedValue({ id: 2, name: 'Новости', slug: 'news', description: null })
    categoryApi.update.mockResolvedValue(category)
    categoryApi.remove.mockResolvedValue(undefined)
  })

  it('creates a category', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Общее')
    await user.type(screen.getByLabelText('Название'), 'Новости')
    await user.type(screen.getByLabelText('Slug'), 'news')
    await user.click(screen.getByRole('button', { name: 'Создать категорию' }))

    await waitFor(() => expect(categoryApi.create).toHaveBeenCalledWith({ name: 'Новости', slug: 'news', description: null }))
  })

  it('shows validation errors without sending an empty form', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Общее')
    await user.click(screen.getByRole('button', { name: 'Создать категорию' }))

    expect(await screen.findByText('Укажите название категории.')).toBeInTheDocument()
    expect(screen.getByText('Укажите slug категории.')).toBeInTheDocument()
    expect(categoryApi.create).not.toHaveBeenCalled()
  })

  it('edits a category', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Общее')
    await user.click(screen.getByRole('button', { name: 'Редактировать Общее' }))
    await user.clear(screen.getByLabelText('Название'))
    await user.type(screen.getByLabelText('Название'), 'Обновлённое')
    await user.click(screen.getByRole('button', { name: 'Сохранить изменения' }))

    await waitFor(() => expect(categoryApi.update).toHaveBeenCalledWith(1, { name: 'Обновлённое', slug: 'general', description: 'Общие обсуждения' }))
  })

  it('deletes a category only after confirmation', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Общее')
    await user.click(screen.getByRole('button', { name: 'Удалить Общее' }))
    expect(categoryApi.remove).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Удалить' }))

    await waitFor(() => expect(categoryApi.remove).toHaveBeenCalledWith(1))
  })
})
