import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { Sidebar } from './Sidebar.tsx'

const categoriesState = vi.hoisted(() => ({ isPending: false, isError: false, data: [{ id: 1, name: 'Общее', slug: 'general', description: null }] }))

vi.mock('../../features/categories/api/queries.ts', () => ({ useCategoriesQuery: () => categoriesState }))

describe('Sidebar', () => {
  it('marks only Home as active on the default feed', () => {
    render(<MemoryRouter initialEntries={['/']}><Sidebar /></MemoryRouter>)

    expect(screen.getByRole('link', { name: 'Главная' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Популярные' })).not.toHaveAttribute('aria-current')
  })

  it('marks only Popular as active on the popular feed', () => {
    render(<MemoryRouter initialEntries={['/?tab=popular']}><Sidebar /></MemoryRouter>)

    expect(screen.getByRole('link', { name: 'Главная' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Популярные' })).toHaveAttribute('aria-current', 'page')
  })

  it('links each category to its page', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>)

    expect(screen.getByRole('link', { name: 'Общее' })).toHaveAttribute('href', '/categories/general')
  })

  it('uses the Categories heading as the link to all categories', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>)

    expect(screen.getByRole('link', { name: 'Категории' })).toHaveAttribute('href', '/categories')
  })

  it('keeps overflowing navigation inside a scrollable sidebar', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>)

    expect(screen.getByRole('complementary', { name: 'Навигация форума' })).toHaveClass('overflow-y-auto')
  })
})
