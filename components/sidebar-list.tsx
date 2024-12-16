'use client'

import { useState, useEffect } from 'react'
import { clearChats, getChats } from '@/app/actions'
import { ClearHistory } from '@/components/clear-history'
import { SidebarItems } from '@/components/sidebar-items'
import { ThemeToggle } from '@/components/theme-toggle'
import { redirect, usePathname } from 'next/navigation'
import { ErrorMessage } from '@/app/constants'
import { Chat } from '@/lib/types'

interface SidebarListProps {
  userId?: string
  children?: React.ReactNode
}

export function SidebarList({ userId }: SidebarListProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const pathname = usePathname()

  const fetchChats = async () => {
    const loadedChats = await getChats(userId)
    if (loadedChats && !(ErrorMessage.message in loadedChats)) {
      setChats(loadedChats as Chat[])
    } else {
      redirect('/')
    }
  }

  useEffect(() => {
    fetchChats()

    // Fetch chats again after a 10 second delay to account for newly created chats
    const timer = setTimeout(() => {
      fetchChats()
    }, 10000)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        {chats.length ? (
          <div className="space-y-2 px-2">
            <SidebarItems chats={chats} />
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No chat history</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-4">
        <ThemeToggle />
        <ClearHistory clearChats={clearChats} isEnabled={chats.length > 0} />
      </div>
    </div>
  )
}
