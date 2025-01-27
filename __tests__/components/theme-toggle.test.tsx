import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useTheme } from 'next-themes'

jest.mock('next-themes', () => ({
  useTheme: jest.fn()
}))

jest.mock('@/components/ui/icons', () => ({
  IconMoon: () => <span data-testid="icon-moon">Moon</span>,
  IconSun: () => <span data-testid="icon-sun">Sun</span>
}))

describe('ThemeToggle', () => {
  let mockSetTheme: jest.Mock<any, any, any>

  beforeEach(() => {
    mockSetTheme = jest.fn()
    jest.spyOn(React, 'useTransition').mockReturnValue([false, jest.fn()])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with the current theme as light', () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)

    expect(screen.getByTestId('icon-sun')).toBeInTheDocument()
    expect(screen.queryByTestId('icon-moon')).not.toBeInTheDocument()
  })

  it('renders correctly with the current theme as dark', () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)

    expect(screen.getByTestId('icon-moon')).toBeInTheDocument()
    expect(screen.queryByTestId('icon-sun')).not.toBeInTheDocument()
  })

  it('does not render any icon if theme is null', () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: null,
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)

    expect(screen.queryByTestId('icon-sun')).not.toBeInTheDocument()
    expect(screen.queryByTestId('icon-moon')).not.toBeInTheDocument()
  })

  it('toggles theme from light to dark when clicked', () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('toggles theme from dark to light when clicked', () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})
