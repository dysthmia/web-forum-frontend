import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button.tsx'

describe('Button', () => {
  it('prevents a second action while loading', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button loading onClick={onClick}>Сохранить</Button>)
    await user.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(onClick).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeDisabled()
  })
})
