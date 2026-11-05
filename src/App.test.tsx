import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'
import { QueryProvider } from './app/providers/QueryProvider.tsx'
import { AuthProvider } from './features/auth/model/AuthProvider.tsx'

describe('App', () => {
  it('renders the home route placeholder', () => {
    render(<QueryProvider><AuthProvider><MemoryRouter initialEntries={['/']}><App /></MemoryRouter></AuthProvider></QueryProvider>)

    expect(screen.getByRole('heading', { name: 'Обсуждения' })).toBeInTheDocument()
  })
})
