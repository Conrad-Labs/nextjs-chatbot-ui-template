'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { Button } from '@/components/ui/button'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { nanoid } from 'nanoid'
import { Session } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { Chat } from '@/lib/types'
import { getChat, saveChat } from '@/app/actions'
import { addMessage, setThreadId } from '@/lib/redux/slice/chat.slice'
import { useDispatch, useSelector } from 'react-redux'
import OpenAI from 'openai'

const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
const openAIAssistantId = process.env.NEXT_PUBLIC_ASSISTANT_ID

export function PromptForm({
  input,
  setInput,
  session,
  id
}: {
  input: string
  setInput: (value: string) => void
  session?: Session
  id?: string
}) {
  const router = useRouter()
  const openai = new OpenAI({
    apiKey: openAIApiKey,
    dangerouslyAllowBrowser: true
  })
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const dispatch = useDispatch()
  const messages = useSelector((state: any) => state.chat.messages)
  const threadId = useSelector((state: any) => state.chat.threadId)
  const pathname = usePathname()

  async function submitUserMessage(messageId: string, value: string) {
    const createdAt = new Date()
    const firstMessageContent = value as string
    const title = firstMessageContent.substring(0, 100)

    let currentThreadId = threadId
    let chat: Chat

    if (!threadId) {
      const emptyThread = await openai.beta.threads.create()
      dispatch(setThreadId(emptyThread.id))
      currentThreadId = emptyThread.id

      chat = {
        id: id as string,
        title,
        createdAt,
        path: `/chat/${id}`,
        messages: [{ id: messageId, message: value, role: 'user' }],
        threadId: currentThreadId
      }
    } else {
      chat = (await getChat(id as string, session?.user?.id as string)) as Chat
      if (!chat) {
        throw new Error('Chat not found!')
      }

      chat.messages = [
        ...(chat.messages || []),
        {
          id: messageId,
          role: 'user',
          message: value
        }
      ]
      currentThreadId = chat.threadId
    }

    await openai.beta.threads.messages.create(currentThreadId, {
      role: 'user',
      content: value
    })

    let run = await openai.beta.threads.runs.createAndPoll(currentThreadId, {
      assistant_id: openAIAssistantId || ''
    })

    if (run.status === 'completed' && chat) {
      const messages = await openai.beta.threads.messages.list(run.thread_id)

      const newAssistantChatId = nanoid()
      const reversedMessages = messages.data.reverse()
      const assistantResponse =
        // @ts-ignore
        reversedMessages[reversedMessages.length - 1].content[0].text.value

      const assistantMessage = {
        id: newAssistantChatId,
        message: assistantResponse,
        role: 'assistant'
      }
      dispatch(addMessage(assistantMessage))
      chat.messages
        ? chat.messages.push(assistantMessage)
        : (chat.messages = [assistantMessage])
    } else {
      console.error(run.status)
    }

    await saveChat(chat)

    return {
      id: messageId,
      message: value,
      role: 'user'
    }
  }

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <form
      ref={formRef}
      onSubmit={async (e: any) => {
        e.preventDefault()
        const messageId = nanoid()

        // Blur focus on mobile
        if (window.innerWidth < 600) {
          e.target['message']?.blur()
        }

        const value = input.trim()
        setInput('')
        if (!value) return

        dispatch(addMessage({ id: messageId, message: value, role: 'user' }))

        // Submit and get response message
        const responseMessage = await submitUserMessage(messageId, value)
      }}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4"
              onClick={() => {
                router.push('/new')
              }}
            >
              <IconPlus />
              <span className="sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Send a message."
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="absolute right-0 top-[13px] sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" size="icon" disabled={input === ''}>
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}
