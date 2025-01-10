import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { SidebarProvider, useSidebar } from '@/lib/hooks/use-sidebar'

describe('SidebarProvider', () => {
  let getItemMock: jest.Mock
  let setItemMock: jest.Mock

  beforeEach(() => {
    getItemMock = jest.fn()
    setItemMock = jest.fn()
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: getItemMock,
        setItem: setItemMock
      },
      writable: true
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const TestComponent = () => {
    const { isSidebarOpen, toggleSidebar } = useSidebar()
    return (
      <div>
        <p data-testid="sidebar-state">
          {isSidebarOpen ? 'Sidebar is open' : 'Sidebar is closed'}
        </p>
        <button data-testid="toggle-button" onClick={toggleSidebar}>
          Toggle Sidebar
        </button>
      </div>
    )
  }

  it('should initialize sidebar state from localStorage', () => {
    getItemMock.mockReturnValue(JSON.stringify(false))

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    )

    expect(getItemMock).toHaveBeenCalledWith('sidebar')
    expect(screen.getByTestId('sidebar-state').textContent).toBe(
      'Sidebar is closed'
    )
  })

  it('should default to open if localStorage is empty', () => {
    getItemMock.mockReturnValue(null)

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    )

    expect(getItemMock).toHaveBeenCalledWith('sidebar')
    expect(screen.getByTestId('sidebar-state').textContent).toBe(
      'Sidebar is open'
    )
  })

  it('should toggle the sidebar state and update localStorage', () => {
    getItemMock.mockReturnValue(JSON.stringify(true))

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    )

    const toggleButton = screen.getByTestId('toggle-button')
    fireEvent.click(toggleButton)

    expect(screen.getByTestId('sidebar-state').textContent).toBe(
      'Sidebar is closed'
    )
    expect(setItemMock).toHaveBeenCalledWith('sidebar', JSON.stringify(false))

    fireEvent.click(toggleButton)

    expect(screen.getByTestId('sidebar-state').textContent).toBe(
      'Sidebar is open'
    )
    expect(setItemMock).toHaveBeenCalledWith('sidebar', JSON.stringify(true))
  })

  it('should throw an error if useSidebar is used outside of SidebarProvider', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const TestWrapper = () => {
      useSidebar()
      return null
    }

    expect(() => render(<TestWrapper />)).toThrow(
      'useSidebarContext must be used within a SidebarProvider'
    )

    consoleErrorSpy.mockRestore()
  })
})
