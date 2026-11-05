import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'
import { QueryProvider } from './app/providers/QueryProvider.tsx'

describe('App', () => {
  it('renders the home route placeholder', () => {
    render(<QueryProvider><MemoryRouter initialEntries={['/']}><App /></MemoryRouter></QueryProvider>)

    expect(screen.getByRole('heading', { name: 'Обсуждения' })).toBeInTheDocument()
  })
})
