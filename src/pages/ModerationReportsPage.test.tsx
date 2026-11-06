import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../shared/api/errors.ts'
import { ModerationReportsPage } from './ModerationReportsPage.tsx'

const moderationApi = vi.hoisted(() => ({ reports: vi.fn(), reviewReport: vi.fn() }))
vi.mock('../features/moderation/api/moderationApi.ts', () => ({ moderationApi }))

const report = { reportId: 5, postId: 9, reporterId: 3, reporterUsername: 'alice', reason: 'Нарушение правил', createdAt: '2026-01-01T00:00:00Z' }

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function close() { this.removeAttribute('open') }
})

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}><ModerationReportsPage /></QueryClientProvider>)
}

describe('ModerationReportsPage', () => {
  beforeEach(() => {
    moderationApi.reports.mockResolvedValue([report])
    moderationApi.reviewReport.mockResolvedValue(undefined)
  })

  it('accepts a report after confirmation', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Нарушение правил')

    await user.click(screen.getByRole('button', { name: 'Принять жалобу #5' }))
    await user.click(screen.getByRole('button', { name: 'Подтвердить решение' }))

    await waitFor(() => expect(moderationApi.reviewReport).toHaveBeenCalledWith(5, 'accepted', false))
  })

  it('rejects a report with hidePost always false', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Нарушение правил')

    await user.click(screen.getByLabelText('Скрыть сообщение'))
    await user.click(screen.getByRole('button', { name: 'Отклонить жалобу #5' }))
    await user.click(screen.getByRole('button', { name: 'Подтвердить решение' }))

    await waitFor(() => expect(moderationApi.reviewReport).toHaveBeenCalledWith(5, 'rejected', false))
  })

  it('passes hidePost only when accepting a report', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Нарушение правил')

    await user.click(screen.getByLabelText('Скрыть сообщение'))
    await user.click(screen.getByRole('button', { name: 'Принять жалобу #5' }))
    await user.click(screen.getByRole('button', { name: 'Подтвердить решение' }))

    await waitFor(() => expect(moderationApi.reviewReport).toHaveBeenCalledWith(5, 'accepted', true))
  })

  it('explains a conflict for an already resolved report', async () => {
    const user = userEvent.setup()
    moderationApi.reviewReport.mockRejectedValue(new ApiError('CONFLICT', 'Report has already been resolved with a different decision.', 409, 'Report has already been resolved with a different decision.'))
    renderPage()
    await screen.findByText('Нарушение правил')

    await user.click(screen.getByRole('button', { name: 'Принять жалобу #5' }))
    await user.click(screen.getByRole('button', { name: 'Подтвердить решение' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Жалоба уже была обработана другим решением.')
  })

  it('explains that the first post cannot be hidden', async () => {
    const user = userEvent.setup()
    moderationApi.reviewReport.mockRejectedValue(new ApiError('CONFLICT', 'The first post can only be hidden by deleting its topic.', 409, 'The first post can only be hidden by deleting its topic.'))
    renderPage()
    await screen.findByText('Нарушение правил')

    await user.click(screen.getByLabelText('Скрыть сообщение'))
    await user.click(screen.getByRole('button', { name: 'Принять жалобу #5' }))
    await user.click(screen.getByRole('button', { name: 'Подтвердить решение' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Нельзя скрыть первое сообщение темы: скройте тему целиком.')
  })
})
