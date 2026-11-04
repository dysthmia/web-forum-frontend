import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { Sidebar } from './Sidebar.tsx'

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
})
