import { Separator } from '@/components/ui/separator'
import { Session } from '@/lib/types'
import Link from 'next/link'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { ChatMessage, Roles } from '@/lib/redux/slice/chat.slice'
import { BotMessage, UserMessage } from './stocks/message'
import { useSelector } from 'react-redux'
import { IconSpinner } from './ui/icons'

export interface ChatList {
  session?: Session
  isShared: boolean
  initialMessages: ChatMessage[]
}

export function ChatList({ initialMessages, session, isShared }: ChatList) {
  const messages = useSelector((state: any) => state.chat.messages)

  // if (!messages?.length) {
  //   return null
  // }

  const combinedMessages =
    initialMessages && initialMessages.length > 0
      ? [
          ...Array.from(
            new Map(
              [...initialMessages, ...messages].map(msg => [msg.id, msg])
            ).values()
          )
        ]
      : [...messages]
  const isLastMessageFromUser =
    combinedMessages[combinedMessages.length - 1].role === Roles.user

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {!isShared && !session ? (
        <>
          <div className="group relative mb-4 flex items-start md:-ml-12">
            <div className="bg-background flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border shadow-sm">
              <ExclamationTriangleIcon />
            </div>
            <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
              <p className="text-muted-foreground leading-normal">
                Please{' '}
                <Link href="/login" className="underline">
                  log in
                </Link>{' '}
                or{' '}
                <Link href="/signup" className="underline">
                  sign up
                </Link>{' '}
                to save and revisit your chat history!
              </p>
            </div>
          </div>
          <Separator className="my-4" />
        </>
      ) : null}

      {combinedMessages.map((item: ChatMessage, index: number) => (
        <div key={item.id}>
          {item.role === Roles.user ? (
            <div className="flex flex-col items-start">
              <UserMessage content={item} />
              {isLastMessageFromUser &&
                index === combinedMessages.length - 1 && (
                  <div className="mt-4">
                    <IconSpinner></IconSpinner>
                  </div>
                )}
            </div>
          ) : (
            <BotMessage
              content={item.message}
              citations={item.citations}
            ></BotMessage>
          )}
          {index < combinedMessages.length - 1 && (
            <Separator className="my-4" />
          )}
        </div>
      ))}
    </div>
  )
}
