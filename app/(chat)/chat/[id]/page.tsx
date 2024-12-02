import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getChat, getMissingKeys } from '@/app/actions'
import { Chat } from '@/components/chat'
import { Chat as UserChatMessage, Session } from '@/lib/types'
import { ChatMessage, Roles } from '@/lib/redux/slice/chat.slice'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const session = await auth()

  if (!session?.user) {
    return {}
  }

  const chat = await getChat(params.id, session.user.id)
  if (!chat || 'error' in chat) {
    redirect('/')
  } else {
    return {
      title: chat?.title.toString().slice(0, 50) ?? 'Chat'
    }
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = (await auth()) as Session
  const missingKeys = await getMissingKeys()

  if (!session?.user) {
    redirect(`/login?next=/chat/${params.id}`)
  }

  const userId = session.user.id as string
  const chat: UserChatMessage | null | { error: string } = await getChat(
    params.id,
    userId
  )

  if (!chat || 'error' in chat) {
    redirect('/')
  } else {
    if (chat?.userId !== session?.user?.id) {
      notFound()
    }

    const { id, title } = chat as UserChatMessage
    const updatedChats: ChatMessage[] = chat.messages
      ? chat.messages
      : [
          {
            id: id,
            message: title,
            role: Roles.user
          }
        ]
    const threadId = chat.threadId

    return (
      <Chat
        id={chat.id}
        session={session}
        initialMessages={updatedChats}
        missingKeys={missingKeys}
        threadId={threadId}
      />
    )
  }
}
